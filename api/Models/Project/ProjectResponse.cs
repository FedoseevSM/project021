using System;
using System.Collections.Generic;
using System.Linq;
using Web.Entities;

namespace Web.Models.Project
{
  public class ProjectResponse
  {

    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }


#nullable enable
    public string? Content { get; set; }

    public string Data { get; set; }

    public int Type { get; set; }
    public string? Cover { get; set; }
    public int? UserId { get; set; }
#nullable disable

    public int LikesCount { get; set; }

    public Web.Models.User.UserResponse? User { get; set; }

    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public bool Liked { set; get; }
    public int CommentsCount { get; set; }
    public int PageCount { get; set; }
    public bool Participate { set; get; }
    public bool Requested { set; get; }
    public bool Following { set; get; }
    public int FollowersCount { get; set; }
    public int UsersCount { get; set; }

    public bool Draft { get; set; }
  }
}