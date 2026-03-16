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

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "SuperAdmin")]
        [HttpPut("set-role")]
        public async Task<IActionResult> SetRole([FromQuery] Guid userId, [FromQuery] UserRole role)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            user.Role = role;
            await _db.SaveChangesAsync();
            return Ok(user);
        }
    }
}
