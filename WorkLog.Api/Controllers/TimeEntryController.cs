using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
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
            var userIdValue = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
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
            var taskExists = await _db.TimeEntries.AnyAsync(x => x.Id == dto.TaskItemId);
            if (!taskExists) 
            {
                return NotFound();
            }
            var hasActiveEntry = await _db.TimeEntries.AnyAsync(x => x.EndedAtUtc == null);
            if (hasActiveEntry) 
            {
                return BadRequest(new { message = "You already have an active timer" });
            }//continue from here
        }
    } 
}
