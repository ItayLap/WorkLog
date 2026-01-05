using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkLog.Domain.Entities;

namespace WorkLog.infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<Task> Tasks => Set<Task>();
        public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();

        protected override void OnModelCreating(ModelBuilder model)
        {
            model.Entity<User>()
                .HasIndex(x => x.Email)
                .IsUnique();

            model .Entity<Project>()
                .HasMany<TaskItem>()
                .WithOne()
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<TaskItem>()
                .HasMany<TimeEntry>()
                .WithOne()
                .HasForeignKey(x => x.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
