using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class AddProjectCover : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageCount",
                table: "Projects");

            migrationBuilder.AddColumn<string>(
                name: "Cover",
                table: "Projects",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cover",
                table: "Projects");

            migrationBuilder.AddColumn<int>(
                name: "ImageCount",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
