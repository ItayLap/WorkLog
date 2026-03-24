using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
//    [Authorize(Roles = "Admin,SuperAdmin")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,SuperAdmin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AdminController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users.Select(u => new
            {
               id = u.Id,
               email =  u.Email,
               role = u.Role.ToString()
            }).ToListAsync();
            return Ok(users);
        }

        [HttpGet("DebugClaims")]
        public IActionResult DebugClaims()
        {
            return Ok(User.Claims.Select(c => new{c.Type, c.Value}));
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "SuperAdmin,Admin")]
        [HttpPut("set-role")]
        public async Task<IActionResult> SetRole([FromQuery] Guid userId, [FromQuery] UserRole role)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            if (user.Role == UserRole.SuperAdmin)
            {
                return BadRequest("Cannot change SpAd role");
            }
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(currentUserId == user.Id.ToString())
            {
                return BadRequest("you cannot change your own role");
            }
            user.Role = role;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
