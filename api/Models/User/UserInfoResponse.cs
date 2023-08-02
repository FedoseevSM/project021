using System;

namespace Web.Models.User
{
  public class UserInfoResponse
  {
    public int UserId { get; set; }
    public string City { get; set; }
    public string[] Tags { get; set; }
    public string[] Links { get; set; }
    public string[] Skills { get; set; }
    public string Education { get; set; }
    public DateTime? Updated { get; set; }
  }
}