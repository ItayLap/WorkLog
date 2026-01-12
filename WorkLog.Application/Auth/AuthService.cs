using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkLog.Application.Auth;
using WorkLog.Domain.Entities;
using WorkLog.infrastructure.Data;

namespace WorkLog.infrastructure.Auth
{
    public class AuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly JwtService _jwt;
        public AuthService(ApplicationDbContext db, JwtService jwt) 
        {
            _db = db;
            _jwt = jwt;
        }

        public async Task<AuthResponse> Register(RegisterRequest request)
        {
            if (await _db.Users.AnyAsync(x => x.Email == request.Email)) throw new Exception("User already exists");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = PasswordHasher.Hash(request.Password)
            };

            _db.Users.Add(user); 
            await _db.SaveChangesAsync();
            return new AuthResponse { Token = _jwt.Generate(user) }; 
        }
        public async Task<AuthResponse> Login(LogInRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == request.Email) ?? throw new Exception("Invalid credentials");

            if (!PasswordHasher.Verify(request.Password, user.PasswordHash)) throw new Exception("Invalid credentials");

            return new AuthResponse{ 
                Token = _jwt.Generate(user)
            }; 
        }
    }
}
