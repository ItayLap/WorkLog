using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkLog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TaskDeletete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeEntries_Tasks_TaskItemId",
                table: "TimeEntries");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeEntries_Tasks_TaskItemId",
                table: "TimeEntries",
                column: "TaskItemId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeEntries_Tasks_TaskItemId",
                table: "TimeEntries");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeEntries_Tasks_TaskItemId",
                table: "TimeEntries",
                column: "TaskItemId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
