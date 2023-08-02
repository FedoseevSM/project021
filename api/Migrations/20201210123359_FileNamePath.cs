using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class FileNamePath : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Files",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "Files",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "Files");
        }
    }
}
