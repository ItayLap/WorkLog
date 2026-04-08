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
                .Select(x => new
                {
                    x.Id,
                    x.TaskItemId,
                    x.UserId,
                    x.StartedAtUtc,
                    x.EndedAtUtc,
                    x.Note,
                    DurationMinutes = x.EndedAtUtc.HasValue ? EF.Functions.DateDiffMinute(x.StartedAtUtc, x.EndedAtUtc.Value) : (int?)null

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

            entry.EndedAtUtc = DateTime.UtcNow;

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
                DurationMinutes = EF.Functions.DateDiffMinute(entry.StartedAtUtc, entry.EndedAtUtc.Value),
            });
        }
    } 
}
