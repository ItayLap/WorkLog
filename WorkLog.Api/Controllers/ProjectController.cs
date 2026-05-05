using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<ProjectController> _logger;
        public ProjectController(ApplicationDbContext db, ILogger<ProjectController> logger)
        {
            _logger = logger;
            _db = db;
        }

        private Guid? GetUserId()
        {
            var id = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }

        [HttpGet]
        public async Task<IActionResult> GetMy()
        {
            try
            {
                var userId = GetUserId();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var projects = await _db.Projects
                    .Where(p => p.UserId == userId.Value)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.CreatedAtUtc
                    }).ToListAsync();
                _logger.LogInformation($"retrived{projects.Count} projects for user {userId}");
                return Ok(projects);

            }catch(Exception ex)
            {
                return StatusCode(500, ex);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                UserId = userId.Value,
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();
            return Ok(new
            {
                project.Id,
                project.Name
            });
        }

        [AllowAnonymous]
        [HttpGet("debug")]
        public IActionResult Debug()
        {
            if (User == null)
            {
                return Ok("user not found");
            }
            return Ok(User.Claims.Select(c => new { c.Type, c.Value}));
        }

    }
    public class CreateProjectDto
    {
        public string Name { get; set; } = null!;
    }
    public class UpdateProjectDto
    {
        public string Name { get; set; } = null!;
    }
}
