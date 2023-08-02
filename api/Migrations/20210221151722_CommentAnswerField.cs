using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class CommentAnswerField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AnswerId",
                table: "Comments",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnswerId",
                table: "Comments");
        }
    }
}
