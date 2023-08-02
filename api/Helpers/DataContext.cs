using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Web.Entities;

namespace Web.Helpers
{
  public class DataContext : DbContext
  {
    public DbSet<User> Users { get; set; }

    public DbSet<Project> Projects { get; set; }

    public DbSet<Page> Pages { get; set; }

    public DbSet<Draft> Drafts { get; set; }

    public DbSet<PageDraft>  PageDrafts { get; set; }

    public DbSet<Comment> Comments { get; set; }

    public DbSet<UserInfo> UserInfo { get; set; }

    public DbSet<CommentLike> CommentLikes { get; set; }

    public DbSet<ProjectLike> ProjectLikes { get; set; }

    public DbSet<File> Files { get; set; }

    public DbSet<UserProject> UserProjects { get; set; }

    public DbSet<UserProjectRequest> UserProjectRequests { get; set; }

    public DbSet<UserFollowing> UserFollowings { get; set; }

    public DbSet<Event> Events { get; set; }

    private readonly IConfiguration Configuration;

    public DataContext(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
      options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection"));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
    }
  }
}