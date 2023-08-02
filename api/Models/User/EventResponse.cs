using System;

namespace Web.Models.User
{
  public class EventResponse
  {
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Type { get; set; }

    public string Data { get; set; }

    public DateTime Created { get; set; }

    public DateTime? Read { get; set; }
  }
}