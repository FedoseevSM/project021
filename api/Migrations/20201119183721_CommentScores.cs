using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Web.Migrations
{
    public partial class CommentScores : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_CommentsStatuses_StatusId",
                table: "Comments");

            migrationBuilder.DropTable(
                name: "CommentsStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Comments_StatusId",
                table: "Comments");

            migrationBuilder.AddColumn<int>(
                name: "NegativeScore",
                table: "Comments",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PositiveScore",
                table: "Comments",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NegativeScore",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "PositiveScore",
                table: "Comments");

            migrationBuilder.CreateTable(
                name: "CommentsStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NegativeScore = table.Column<int>(type: "integer", nullable: false),
                    PositiveScore = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentsStatuses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_StatusId",
                table: "Comments",
                column: "StatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_CommentsStatuses_StatusId",
                table: "Comments",
                column: "StatusId",
                principalTable: "CommentsStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
