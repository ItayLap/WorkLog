using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WorkLog.Domain.Entities;

namespace WorkLog.infrastructure.Auth
{
    public class JwtService
    {
        private readonly string _key;
        public JwtService(string key)
        {
            _key = key;
        }

        public string Generate(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims:claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds);

            Console.WriteLine("JWT GENARATE KEY:" + _key);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
