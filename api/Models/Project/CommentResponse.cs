using System;
using Web.Entities;

namespace Web.Models.Project
{
  public class CommentResponse
  {

    public int Id { get; set; }

    public string Name { get; set; }

    public string Text { get; set; }

    public string Data { get; set; }

    public int Depth { get; set; }

    public int UserId { get; set; }
    public Web.Models.User.UserResponse User { get; set; }

#nullable enable
    public int? PageId { get; set; }
    public Web.Entities.Page? Page { get; set; }

    public string? Image { get; set; }

    public int? ParentId { get; set; }

    public int? ThreadId { get; set; }
#nullable disable

    public int ProjectId { get; set; }

    public Web.Entities.Project Project { get; set; }

    public DateTime Created { get; set; }

    public bool Liked { get; set; }

    public int PositiveScore { get; set; }

    public int NegativeScore { get; set; }

    public int AnswersCount { get; set; }

    public bool Anonymous { get; set; }

    public bool Deleted { get; set; }
  }
}