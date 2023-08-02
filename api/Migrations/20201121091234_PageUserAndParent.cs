using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class PageUserAndParent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "Pages",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Pages",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pages_ParentId",
                table: "Pages",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Pages_UserId",
                table: "Pages",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Pages_ParentId",
                table: "Pages",
                column: "ParentId",
                principalTable: "Pages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Users_UserId",
                table: "Pages",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Pages_ParentId",
                table: "Pages");

            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Users_UserId",
                table: "Pages");

            migrationBuilder.DropIndex(
                name: "IX_Pages_ParentId",
                table: "Pages");

            migrationBuilder.DropIndex(
                name: "IX_Pages_UserId",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Pages");
        }
    }
}
