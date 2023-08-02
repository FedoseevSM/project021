using System;
using System.ComponentModel.DataAnnotations;

namespace Web.Entities
{
  public class UserFollowing
  {
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }
  }
}
