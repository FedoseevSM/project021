using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class ProjectDraftUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DraftId",
                table: "ProjectDrafts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "ProjectDrafts",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDrafts_DraftId",
                table: "ProjectDrafts",
                column: "DraftId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDrafts_UserId",
                table: "ProjectDrafts",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectDrafts_Drafts_DraftId",
                table: "ProjectDrafts",
                column: "DraftId",
                principalTable: "Drafts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectDrafts_Users_UserId",
                table: "ProjectDrafts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectDrafts_Drafts_DraftId",
                table: "ProjectDrafts");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectDrafts_Users_UserId",
                table: "ProjectDrafts");

            migrationBuilder.DropIndex(
                name: "IX_ProjectDrafts_DraftId",
                table: "ProjectDrafts");

            migrationBuilder.DropIndex(
                name: "IX_ProjectDrafts_UserId",
                table: "ProjectDrafts");

            migrationBuilder.DropColumn(
                name: "DraftId",
                table: "ProjectDrafts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ProjectDrafts");
        }
    }
}
