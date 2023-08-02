using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Web.Migrations
{
    public partial class AnonComment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "files",
                table: "Pages");

            migrationBuilder.AddColumn<int>(
                name: "Anonymous",
                table: "Comments",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Anonymous",
                table: "Comments");

            migrationBuilder.AddColumn<string[]>(
                name: "files",
                table: "Pages",
                type: "varchar[]",
                nullable: true);
        }
    }
}
