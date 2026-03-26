using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkLog.Domain.Enums;

namespace WorkLog.Domain.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; }

        public Guid ProjectId { get; set; }
        public Project Project { get; set; }

        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();

        public string Title { get; set; } = null!;

        public WorkTaskStatus Status { get; set; } = WorkTaskStatus.Todo;

        public int EstimateMinutes { get; set; }
    }
}
