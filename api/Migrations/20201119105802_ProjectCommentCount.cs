using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class ProjectCommentCount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CommentsCount",
                table: "Projects",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommentsCount",
                table: "Projects");
        }
    }
}
