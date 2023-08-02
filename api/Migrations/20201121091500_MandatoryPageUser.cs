using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class MandatoryPageUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Users_UserId",
                table: "Pages");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Pages",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Users_UserId",
                table: "Pages",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Users_UserId",
                table: "Pages");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Pages",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Users_UserId",
                table: "Pages",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
