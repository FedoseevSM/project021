using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class CommentStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AnswersCount",
                table: "Comments",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CommentsStatuses",
                columns: table => new
                {
                    CommentId = table.Column<int>(nullable: false),
                    PositiveScore = table.Column<int>(nullable: false),
                    NegativeScore = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentsStatuses", x => x.CommentId);
                    table.ForeignKey(
                        name: "FK_CommentsStatuses_Comments_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommentsStatuses");

            migrationBuilder.DropColumn(
                name: "AnswersCount",
                table: "Comments");
        }
    }
}
