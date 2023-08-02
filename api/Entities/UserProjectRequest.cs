using System;
namespace Web.Entities
{
  public class UserProjectRequest
  {
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public DateTime? Requested { get; set; }
  }
}
