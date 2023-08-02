using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class DraftContent : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drafts_Users_UserId",
                table: "Drafts");

            migrationBuilder.DropIndex(
                name: "IX_Drafts_UserId",
                table: "Drafts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Drafts");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "Drafts",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "Drafts");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Drafts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Drafts_UserId",
                table: "Drafts",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drafts_Users_UserId",
                table: "Drafts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
