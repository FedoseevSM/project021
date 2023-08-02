using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Web.Migrations
{
    public partial class UserInfoModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserInfo",
                columns: table => new
                {
                    UserId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId1 = table.Column<int>(nullable: true),
                    City = table.Column<string>(nullable: true),
                    tags = table.Column<string[]>(type: "varchar[]", nullable: true),
                    links = table.Column<string[]>(type: "varchar[]", nullable: true),
                    skills = table.Column<string[]>(type: "varchar[]", nullable: true),
                    Education = table.Column<string>(nullable: true),
                    Cover = table.Column<string>(nullable: true),
                    Updated = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInfo", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserInfo_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserInfo_UserId1",
                table: "UserInfo",
                column: "UserId1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserInfo");
        }
    }
}
