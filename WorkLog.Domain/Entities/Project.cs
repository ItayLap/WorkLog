using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkLog.Domain.Entities
{
    public class Project
    {   
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
