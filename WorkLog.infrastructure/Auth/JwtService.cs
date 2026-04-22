using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WorkLog.Domain.Entities;

namespace WorkLog.infrastructure.Auth
{
    public class JwtService
    {
        private readonly ILogger<JwtService> _logger;
        private readonly string _key;
        public JwtService(IConfiguration config,ILogger<JwtService> logger)
        {
            _key = config["Jwt:Key"];
            _logger = logger;
            if (string.IsNullOrEmpty(_key))
            {
                throw new InvalidOperationException("Jwt key not configured");
            }
        }

        public string Generate(User user)
        {
            var claims = new[]
            {
                //new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("role", user.Role.ToString())
                //new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                //issuer: "WorkLogAPI",
                //audience: "WorkLogClient",
                claims:claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds);

            _logger.LogInformation("JWT GENARATEd KEY for:" + user.Email);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
