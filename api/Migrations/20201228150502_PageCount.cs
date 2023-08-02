using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class PageCount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PageCount",
                table: "Projects",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PageCount",
                table: "Projects");
        }
    }
}
