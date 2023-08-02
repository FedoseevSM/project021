using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Web.Migrations
{
    public partial class PageDraft : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectDrafts");

            migrationBuilder.CreateTable(
                name: "PageDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectId = table.Column<int>(nullable: false),
                    PageId = table.Column<int>(nullable: false),
                    UserId = table.Column<int>(nullable: false),
                    Deleted = table.Column<bool>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    Tag = table.Column<string>(nullable: true),
                    DraftId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageDrafts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PageDrafts_Drafts_DraftId",
                        column: x => x.DraftId,
                        principalTable: "Drafts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PageDrafts_Pages_PageId",
                        column: x => x.PageId,
                        principalTable: "Pages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PageDrafts_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PageDrafts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PageDrafts_DraftId",
                table: "PageDrafts",
                column: "DraftId");

            migrationBuilder.CreateIndex(
                name: "IX_PageDrafts_PageId",
                table: "PageDrafts",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_PageDrafts_ProjectId",
                table: "PageDrafts",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_PageDrafts_UserId",
                table: "PageDrafts",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PageDrafts");

            migrationBuilder.CreateTable(
                name: "ProjectDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Deleted = table.Column<bool>(type: "boolean", nullable: false),
                    DraftId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    PageId = table.Column<int>(type: "integer", nullable: true),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    Tag = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectDrafts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectDrafts_Drafts_DraftId",
                        column: x => x.DraftId,
                        principalTable: "Drafts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectDrafts_Pages_PageId",
                        column: x => x.PageId,
                        principalTable: "Pages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectDrafts_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectDrafts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDrafts_DraftId",
                table: "ProjectDrafts",
                column: "DraftId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDrafts_PageId",
                table: "ProjectDrafts",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDrafts_ProjectId",
                table: "ProjectDrafts",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDrafts_UserId",
                table: "ProjectDrafts",
                column: "UserId");
        }
    }
}
