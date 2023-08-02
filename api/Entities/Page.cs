using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Web.Entities
{
  public class Page
  {
    public int Id { get; set; }
    public string Name { get; set; }

    public string Content { get; set; }

    public string Data { get; set; }

    public int ProjectId { get; set; }
    public Project Project { get; set; }

    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public DateTime? Published { get; set; }

    public bool Draft { get; set; }
    public bool Deleted { get; set; }

    public bool Important { get; set; }

    public int CommentsCount { get; set; }

    public int Depth { get; set; }

    public User User { get; set; }

    public int UserId { get; set; }
#nullable enable
    public Page? Parent { get; set; }
#nullable disable

    public int? ParentId { get; set; }

    [Column("files", TypeName = "integer[]")] public int[] Files { get; set; }
  }
}