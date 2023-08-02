using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;
using Web.Entities;
using System.Collections.Generic;

namespace Web.Hubs
{
  public interface INotificationHub
  {

  }

  public struct UserData
  {
    public int Id { get; set; }

    public string ConnectionId { get; set; }
    public UserData(int userId, string connectionId)
    {
      Id = userId;
      ConnectionId = connectionId;
    }
  }
  public class NotificationHub : Hub, INotificationHub
  {

    public static List<UserData> Data = new List<UserData>();
    // Array =>  { Id: UserId, Users: [] }

    public override async Task OnConnectedAsync()
    {
      var httpContext = Context.GetHttpContext();
      // TODO: replace by token and groups
      if (httpContext.Request.Query.ContainsKey("user"))
      {
        var userId = httpContext.Request.Query["user"];
        if (userId != "") {
          try {
            lock(Data) {
              Data.Add(new UserData(){
                Id = Int32.Parse(userId),
                ConnectionId = Context.ConnectionId
              });
            }
          } catch (FormatException e)
          {
            Console.WriteLine(e.Message);
          }
        }
      }

      await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception e)
    {
      
      Data.RemoveAll(p => p.ConnectionId == Context.ConnectionId);
      await base.OnDisconnectedAsync(e);
    }
  }
}
