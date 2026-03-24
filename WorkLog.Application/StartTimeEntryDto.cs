using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WorkLog.Application
{
    public class StartTimeEntryDto
    {
        public Guid TaskItemId { get; set; }
        public string? Note {  get; set; }
    }
}
