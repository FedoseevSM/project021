using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class ProjectContentDescriptionFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "How",
                table: "Projects",
                newName: "Content"
                );

            migrationBuilder.RenameColumn(
                name: "What",
                table: "Projects",
                newName: "Description");

            migrationBuilder.DropColumn(
                name: "Why",
                table: "Projects");

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Content",
                table: "Projects",
                newName: "How");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Projects",
                newName: "What");

            migrationBuilder.AddColumn<string>(
                name: "Why",
                table: "Projects",
                type: "text",
                nullable: true);
        }
    }
}
