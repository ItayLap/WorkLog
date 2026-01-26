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
        public async Task<AuthResponse> Register(RegisterDto request) => await _auth.Register(request);

        [HttpPost("login")]
        public async Task<AuthResponse> Login(LogInRequest request) => await _auth.Login(request);
    }
}
