using Microsoft.AspNetCore.Mvc;
using WorkLog.Application.Auth;
using WorkLog.infrastructure.Auth;

namespace WorkLog.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;
        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
            try
            {
                return Ok(await _auth.Register(request));
            }catch(InvalidOperationException e)
            {
                return Unauthorized(new {message = e.Message});
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LogInRequest request)
        {
            try
            {
                return Ok(await _auth.Login(request));
            }catch(UnauthorizedAccessException)
            {
                return Unauthorized(new {message = "invalid email or password"});
            }
        }
    }
}
