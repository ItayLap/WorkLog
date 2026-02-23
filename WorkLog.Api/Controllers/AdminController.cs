using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AdminController(ApplicationDbContext db)
        {
            _db = db;
        }
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users.Select(u => new
            {
                u.Id,
                u.Email,
                u.Role
            }).ToListAsync();
            return Ok(users);
        }
        [HttpPut("set-role")]
        public async Task<IActionResult> SetRole(Guid userId, UserRole role)
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
