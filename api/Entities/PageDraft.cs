using System;

namespace Web.Entities
{
  public class PageDraft
  {
    public int Id { get; set; }

    public Project Project { get; set; }
    public int ProjectId { get; set; }
    public Page Page { get; set; }
    public int PageId { get; set; }
    public User User { get; set; }
    public int UserId { get; set; }

    public bool Deleted { get; set; }

    public string Name { get; set; }

    public string Tag { get; set; }

    public Draft Draft { get; set; }

    public int DraftId { get; set; }
  }
}
