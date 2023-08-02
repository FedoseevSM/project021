using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class PageCommentsCount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CommentsCount",
                table: "Pages",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Depth",
                table: "Pages",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommentsCount",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "Depth",
                table: "Pages");
        }
    }
}
