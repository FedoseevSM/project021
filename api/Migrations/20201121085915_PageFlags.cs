using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class PageFlags : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Comments");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Pages",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Pages",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsImportant",
                table: "Pages",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "IsImportant",
                table: "Pages");

            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "Comments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
