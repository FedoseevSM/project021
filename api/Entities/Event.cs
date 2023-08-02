using System;
namespace Web.Entities
{
  public class Event
  {
    public int Id { get; set; }

    public User User { get; set; }

    public int UserId { get; set; }

    public string Type { get; set; }

    public string Data { get; set; }

    public DateTime Created { get; set; }

    public DateTime? Read { get; set; }
  }
}
