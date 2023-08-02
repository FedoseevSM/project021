using System;

namespace Web.Entities
{
  public class Draft
  {
    public int Id { get; set; }

    public string Content { get; set; }
    public string Data { get; set; }

    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }

  }
}
