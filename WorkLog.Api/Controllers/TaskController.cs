using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public TaskController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _db.Tasks.Select(x => new
            {
                x.Id,
                x.Title,
                x.ProjectId
            }).ToListAsync();

            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> AddTask(CreateTaskDto dto)
        {
            //task.Id = Guid.NewGuid();
            //_db.Tasks.Add(task);
            //await _db.SaveChangesAsync();
            //return Ok(new
            //{
            //    task.Id,
            //    task.Title,
            //    task.ProjectId
            //});
            var projectExists = await _db.Projects.AnyAsync( x => x.Id == dto.ProjectId);
            if (!projectExists)
            {
                return BadRequest("Project not found");
            }

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                ProjectId = dto.ProjectId,
                EstimateMinutes = dto.EstimateMinutes
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();
            return Ok(new
            {
                task.Id,
                task.Title,
                task.ProjectId,
                task.EstimateMinutes
            });
        }


    }
    public class CreateTaskDto
    {
        public string Title { get; set; }
        public Guid ProjectId { get; set; }
        public int EstimateMinutes {  get; set; }
    }
}
