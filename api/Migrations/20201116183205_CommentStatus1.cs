using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Web.Migrations
{
    public partial class CommentStatus1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommentsStatuses_Comments_CommentId",
                table: "CommentsStatuses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CommentsStatuses",
                table: "CommentsStatuses");

            migrationBuilder.DropColumn(
                name: "CommentId",
                table: "CommentsStatuses");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "CommentsStatuses",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "Comments",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CommentsStatuses",
                table: "CommentsStatuses",
                column: "Id");

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_CommentsStatuses_StatusId",
                table: "Comments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CommentsStatuses",
                table: "CommentsStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Comments_StatusId",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "CommentsStatuses");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "Comments");

            migrationBuilder.AddColumn<int>(
                name: "CommentId",
                table: "CommentsStatuses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CommentsStatuses",
                table: "CommentsStatuses",
                column: "CommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommentsStatuses_Comments_CommentId",
                table: "CommentsStatuses",
                column: "CommentId",
                principalTable: "Comments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
