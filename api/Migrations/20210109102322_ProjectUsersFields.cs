using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class ProjectUsersFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FollowersCount",
                table: "Projects",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UsersCount",
                table: "Projects",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FollowersCount",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "UsersCount",
                table: "Projects");
        }
    }
}
