using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkLog.Domain.Entities
{
    public class TimeEntry
    {
        public Guid Id {get; set;}

        public Guid TaskItemId { get; set;}
        public TaskItem TaskItem {get; set;} = null!;
        
        public Guid UserId {get; set;}
        public User User{get; set;} = null!;

        public DateTime StartedAtUtc {get; set;}
        public DateTime? EndedAtUtc { get; set;}

        public string? Note {get; set;}
    }
}
