using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class CommentFixFields1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnswerId",
                table: "Comments");

            migrationBuilder.AddColumn<int>(
                name: "Depth",
                table: "Comments",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ThreadId",
                table: "Comments",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Depth",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "ThreadId",
                table: "Comments");

            migrationBuilder.AddColumn<int>(
                name: "AnswerId",
                table: "Comments",
                type: "integer",
                nullable: true);
        }
    }
}
