using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class UserInfoModel1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserInfo_Users_UserId1",
                table: "UserInfo");

            migrationBuilder.DropIndex(
                name: "IX_UserInfo_UserId1",
                table: "UserInfo");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "UserInfo");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "UserInfo",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserInfo_UserId1",
                table: "UserInfo",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UserInfo_Users_UserId1",
                table: "UserInfo",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
