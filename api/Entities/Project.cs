using System;
using System.Collections.Generic;

namespace Web.Entities
{
  public class Project
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Content { get; set; }

    public int Type { get; set; }
    public string Data { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    #nullable enable
    public string? Cover { get; set; }
    #nullable disable
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }

    public int UserId { get; set; }

    #nullable enable
    public int? Deleted { get; set; }
    #nullable disable
    public User User { get; set; }
    public bool Draft { get; set; }

    public List<Comment> Comments { get; set; }
    public List<Page> Pages { get; set; }
    public List<ProjectLike> Likes { get; set; }
    public int PageCount { get; set; }
    public int FollowersCount { get; set; }
    public int UsersCount { get; set; }
  }
}