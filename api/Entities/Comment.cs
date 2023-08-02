using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Web.Entities
{
  public class Comment
  {
    public int Id { get; set; }

    public string Text { get; set; }

    public string Data { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int Depth { get; set; }

    [Index]
    public int? Anonymous { get; set; }

    public Project Project { get; set; }
    public int ProjectId { get; set; }

    #nullable enable
    public int? PageId { get; set; }
    public Page? Page { get; set; }

    public string? Image { get; set; }

    [Index]
    public int? Deleted { get; set; }

    [Index]
    public int? ParentId { get; set; }
    
    [Index]
    public int? ThreadId { get; set; }
    #nullable disable

    public DateTime Created { get; set; }

    public int AnswersCount { get; set; }

    public int PositiveScore { get; set; }

    public int NegativeScore { get; set; }

  }
}
