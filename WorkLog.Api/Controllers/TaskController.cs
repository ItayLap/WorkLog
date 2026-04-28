using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/tasks")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<TaskController> _logger;
        public TaskController(ApplicationDbContext db, ILogger<TaskController> logger)
        {
            _logger = logger;
            _db = db;
        }

        private Guid? GetUserId()
        {
            var id = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }

        private async Task<bool> UserOwnsProject(Guid projectId, Guid userId)
        {
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            return project != null;
        }

        [HttpGet]
        public async Task<IActionResult> GetProjectTasks(Guid projectId)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null)
                {
                    return Unauthorized(new { error = "User not found" });
                }
                var ownsProject = await UserOwnsProject(projectId, userId.Value);
                if (!ownsProject)
                {
                    _logger.LogWarning($"User {userId} tried to access project {projectId} they don't own");
                    return Forbid(); // 403 
                }

                var tasks = await _db.Tasks
                    .Where(t => t.ProjectId == projectId)
                    .Select(t => new
                    {
                        t.Id,
                        t.Title,
                        t.Status,
                        t.EstimateMinutes,
                        TimeEntriesCount = t.TimeEntries.Count
                    }).OrderBy(t => t.Status)
                    .OrderBy(t => t.Title)
                    .ToListAsync();
                _logger.LogInformation($"Retrieved {tasks.Count} from {projectId}");
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project tasks");
                return StatusCode (500, new {error = "Internal server error"});
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddTask(CreateTaskDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Title))
                {
                    return BadRequest(new { error = "taks title empty" });
                }
                if (dto.Title.Length > 500)
                {
                    return BadRequest(new { error = "Task title too long" });
                }
            }
            // continiue rewrite here
            //var projectExists = await _db.Projects.AnyAsync( x => x.Id == dto.ProjectId);
            //if (!projectExists)
            //{
            //    return BadRequest("Project not found");
            //}

            //var task = new TaskItem
            //{
            //    Id = Guid.NewGuid(),
            //    Title = dto.Title,
            //    ProjectId = dto.ProjectId,
            //    EstimateMinutes = dto.EstimateMinutes
            //};

            //_db.Tasks.Add(task);
            //await _db.SaveChangesAsync();
            //return Ok(new
            //{
            //    task.Id,
            //    task.Title,
            //    task.ProjectId,
            //    task.EstimateMinutes
            //});
        }


    }
    public class CreateTaskDto
    {
        public string Title { get; set; }
        public Guid ProjectId { get; set; }
        public int EstimateMinutes {  get; set; }
    }
}
