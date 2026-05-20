using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkLog.Domain.Entities
{
    public enum UserRole
    {
        User = 0,
        Admin = 1,
        SuperAdmin = 2
    }
    public class User
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;

        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<TimeEntry> TimeEntries{ get; set; } = new List<TimeEntry>();

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public UserRole Role { get; set; } = UserRole.User;
    }
}
