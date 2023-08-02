using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class UserCover : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cover",
                table: "UserInfo");

            migrationBuilder.AddColumn<string>(
                name: "Cover",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cover",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "Cover",
                table: "UserInfo",
                type: "text",
                nullable: true);
        }
    }
}
