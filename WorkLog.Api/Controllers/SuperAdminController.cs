using Microsoft.AspNetCore.Mvc;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/superadmin")]
    public class SuperAdminController : ControllerBase
    {
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            return Ok(new
            {
                message = "SuperAdmin access granted",
                serverTime = DateTime.UtcNow,
            });
        }
    }
}
