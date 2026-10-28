using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkLog.Application;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;


namespace WorkLog.Api.Controllers
{
    
    [ApiController]
    [Route("api/time-entries")]
    [Authorize]
    public class TimeEntryController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public TimeEntryController(ApplicationDbContext db)
        {
            _db = db;
        }

        private Guid? GetCurrentUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdValue, out var userId))
            {
                return null;
            }
            return userId;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var entries = await _db.TimeEntries
                .Where(x => x.UserId == userId.Value)
                .OrderByDescending(x => x.StartedAtUtc)
                .Join(_db.Tasks,
                entry => entry.TaskItemId,
                task => task.Id,
                (entry, task) => new
                {
                    entry.Id,
                    entry.UserId,
                    entry.TaskItemId,
                    TaskTitle = task.Title,
                    entry.StartedAtUtc,
                    entry.EndedAtUtc,
                    entry.Note,
                    DurationMinutes = entry.EndedAtUtc.HasValue ? EF.Functions.DateDiffMinute(entry.StartedAtUtc, entry.EndedAtUtc.Value) : (int?)null
                }).ToListAsync();
            return Ok(entries);
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start(StartTimeEntryDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var taskExists = await _db.Tasks.AnyAsync(x => x.Id == dto.TaskItemId);
            if (!taskExists) 
            {
                return NotFound();
            }

            var hasActiveEntry = await _db.TimeEntries.AnyAsync(x => x.UserId == userId.Value && x.EndedAtUtc == null);
            if (hasActiveEntry)
            {
                return BadRequest(new { message = "You already have an active timer" });
            }

            var entry = new TimeEntry
            {
                Id = Guid.NewGuid(),
                TaskItemId = dto.TaskItemId,
                UserId = userId.Value,
                StartedAtUtc = DateTime.UtcNow,
                Note = dto.Note
            };
            _db.TimeEntries.Add(entry);
            await _db.SaveChangesAsync();
            return Ok(new
            {
                entry.Id,
                entry.TaskItemId,
                entry.UserId,
                entry.StartedAtUtc,
                entry.EndedAtUtc,
                entry.Note,
            });
        }
        [HttpPost("{id:guid}/stop")]
        public async Task<IActionResult> Stop(Guid id, StopTimeEntryDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }
            var entry = await _db.TimeEntries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId.Value);
            if (entry == null) 
            {
                return NotFound(new { message = "Time entry not found" });
            }

            if (entry.EndedAtUtc != null) {
                return BadRequest(new { message = "Timer already stopped" });
            }

            var endedAt = DateTime.UtcNow;
            if (dto.EndedAtUtc.HasValue)
            {
                var requested = DateTime.SpecifyKind(dto.EndedAtUtc.Value, DateTimeKind.Utc);
                if (requested < entry.StartedAtUtc || requested > endedAt.AddMinutes(1))
                {
                    return BadRequest(new{message = "Invalid end time"});
                }
                endedAt = requested < endedAt ? requested : endedAt;
            }
            entry.EndedAtUtc = endedAt;

            if (!string.IsNullOrWhiteSpace(dto.Note))
            {
                entry.Note = dto.Note;
            }
            
            await _db.SaveChangesAsync();

            return Ok(new
            {
                entry.Id,
                entry.TaskItemId,
                entry.UserId,
                entry.StartedAtUtc,
                entry.EndedAtUtc,
                entry.Note,
                DurationMinutes = (int)(entry.EndedAtUtc.Value - entry.StartedAtUtc).TotalMinutes
            });
        }

        [HttpPut("{id:guid}/note")]
        public async Task<IActionResult> UpdateNote(Guid id, UpdateNoteDto dto)
        {
            var UserId = GetCurrentUserId();
            if (UserId == null)
            {
                return Unauthorized();
            }
            var entry = await _db.TimeEntries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId.Value);
            if (entry == null)
            {
                return NotFound();
            }
            var note = dto.Note?.Trim();
            if (note != null && note.Length > 500)
            {
                return BadRequest(new{message = "note is too long (500 chars max)"});
            }

            entry.Note = string.IsNullOrWhiteSpace(note) ? null : note;
            await _db.SaveChangesAsync();
            return Ok(new {entry.Id, entry.Note});
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteEntry(Guid id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return NotFound();
            }
            var entry = await _db.TimeEntries
                .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId ==  userId.Value);
            if (entry == null) 
            {
                return NotFound();
            }
            _db.TimeEntries.Remove(entry);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var userId = GetCurrentUserId();
            if(userId == null)
            {
                return Unauthorized();
            }
            var active = await _db.TimeEntries
            .Where(x=> x.UserId == userId.Value && x.EndedAtUtc == null)
            .OrderByDescending(x => x.StartedAtUtc)
            .Join(_db.Tasks,
            entry => entry.TaskItemId,
            task => task.Id, 
            (entry, task) => new{
                entry.Id,
                entry.TaskItemId,
                TaskTitle = task.Title,
                task.ProjectId,
                task.EstimateMinutes,
                entry.UserId,
                entry.StartedAtUtc,
                entry.EndedAtUtc,
                entry.Note
            }).FirstOrDefaultAsync();
            return Ok(new {activeEntry = active});
        }
    } 
}
