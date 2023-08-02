using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class CommentLikes1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommentLikes_Pages_PageId",
                table: "CommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_CommentLikes_Projects_ProjectId",
                table: "CommentLikes");

            migrationBuilder.DropIndex(
                name: "IX_CommentLikes_PageId",
                table: "CommentLikes");

            migrationBuilder.DropIndex(
                name: "IX_CommentLikes_ProjectId",
                table: "CommentLikes");

            migrationBuilder.DropColumn(
                name: "PageId",
                table: "CommentLikes");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "CommentLikes");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "CommentLikes",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "CommentLikes");

            migrationBuilder.AddColumn<int>(
                name: "PageId",
                table: "CommentLikes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "CommentLikes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CommentLikes_PageId",
                table: "CommentLikes",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentLikes_ProjectId",
                table: "CommentLikes",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommentLikes_Pages_PageId",
                table: "CommentLikes",
                column: "PageId",
                principalTable: "Pages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CommentLikes_Projects_ProjectId",
                table: "CommentLikes",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
