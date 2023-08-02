using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class ProjectIsDraft : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Draft",
                table: "Projects",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Draft",
                table: "Projects");
        }
    }
}
