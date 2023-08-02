using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class ChangePageFieldsNames : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<bool>(
                name: "Deleted",
                table: "Pages",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Draft",
                table: "Pages",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Important",
                table: "Pages",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Deleted",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "Draft",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "Important",
                table: "Pages");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Pages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Pages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsImportant",
                table: "Pages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
