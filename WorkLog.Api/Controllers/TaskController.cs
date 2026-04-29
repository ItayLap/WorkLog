using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using WorkLog.Domain.Entities;
using WorkLog.Domain.Enums;
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
        public async Task<IActionResult> AddTask(Guid projectId, [FromBody]CreateTaskDto dto)
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
                if (dto.EstimateMinutes < 0)
                {
                    return BadRequest(new { error = "Estimated minutes should be positive numbers" });
                }
                var userId = GetUserId();
                if (userId == null)
                {
                    return Unauthorized(new { error = "User not found" });
                }
                var project = await _db.Projects
                    .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
                if (project == null)
                {
                    _logger.LogWarning($"User{userId} tried to create task in non-existant or unauthorized project{projectId}");
                    return NotFound(new { error = "project not found" });
                }

                var task = new TaskItem
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    Title = dto.Title.Trim(),
                    Status = WorkTaskStatus.Todo,
                    EstimateMinutes = dto.EstimateMinutes ?? 0
                };
                _db.Tasks.Add(task);
                await _db.SaveChangesAsync();
                _logger.LogInformation($"Succesfully added task {task}");
                return CreatedAtAction(
                    nameof(AddTask),
                    new { projectId, taskId = task.Id },
                    new
                    {
                        task.Id,
                        task.ProjectId,
                        task.Title,
                        task.Status,
                        task.EstimateMinutes
                    });
            }
            catch( Exception ex ) {
                _logger.LogError(ex,"Failed to create add task to project");
                return StatusCode(500, "Server error");
            }
        }
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTask(Guid projectId, Guid taskId)
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
                    return Forbid();   
                }
                var task = await _db.Tasks
                    .Include(t => t.TimeEntries)
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.ProjectId == projectId);

                if (task == null) 
                {
                    return NotFound(new { error = "Task not found" });
                }
                var responce = new
                {
                    task.Id,
                    task.ProjectId,
                    task.Title,
                    task.Status,
                    task.EstimateMinutes,
                    TimeEntries = task.TimeEntries.Select(te => new
                    {
                        te.Id,
                        te.StartedAtUtc,
                        te.Note,
                    })
                };
                return Ok(responce);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get task from project");
                return StatusCode(500, "Server error");
            }
        }
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = null!;
        public int? EstimateMinutes {  get; set; }
    }

    public class UpdateTaskDto 
    {
        public string? Title { get; set; }
        public WorkTaskStatus? Status { get; set; }
        public int? EstimateMinutes { get; set; }
    }
}
