using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class DataField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Projects",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Pages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Drafts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Comments",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Data",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Data",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "Data",
                table: "Drafts");

            migrationBuilder.DropColumn(
                name: "Data",
                table: "Comments");
        }
    }
}
