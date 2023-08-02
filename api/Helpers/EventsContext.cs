using System;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Linq;
using Web.Hubs;

namespace Web.Helpers
{
  public interface IEventsContext
  {
    Task<List<BsonDocument>> GetUserEvents(int userId);

    Task<bool> AddEvent(BsonDocument data, int userId);

    Task ReadEvent(string eventId);

    Task RemoveEvents(BsonDocument data);

    Task DeleteEvent(string eventId);
  }
  public class EventsContext: IEventsContext
  {
    private readonly IConfiguration Configuration;
    private readonly IMongoClient _client;
    private readonly IMongoDatabase _db;

    private readonly IHubContext<NotificationHub> _hub;

    public EventsContext(
      IConfiguration configuration,
      IHubContext<NotificationHub> hub
    )
    {
      var dbName = configuration.GetSection("EventsDatabaseSettings:DatabaseName").Value;
      var userName = configuration.GetSection("EventsDatabaseSettings:UserName").Value;
      var password = configuration.GetSection("EventsDatabaseSettings:Password").Value;
      var credential = MongoCredential.CreateCredential(
        "admin",
        "admin",
        "password"
      );
      var hostName = configuration.GetSection("EventsDatabaseSettings:HostName").Value;
      var settings = new MongoClientSettings()
      {
        Credential = credential,
        Server = new MongoServerAddress(hostName)
      };
      try {
        _client = new MongoClient(settings);
        _db = _client.GetDatabase("admin");
      } catch (Exception e) {
        Console.WriteLine(e.ToString());
      }
      _hub = hub;
    }

    public async Task<List<BsonDocument>> GetUserEvents(int userId)
    {
      var collection = _db.GetCollection<BsonDocument>("events");
      var filter = new BsonDocument("$and", new BsonArray{
        new BsonDocument("userId", userId),
        new BsonDocument("created", new BsonDocument("$gte", DateTime.UtcNow.AddDays(-7)))
      });
      try {
        var events = await collection.Find(filter).ToListAsync();
        return events;
      } catch(Exception e) {
        Console.WriteLine(e.ToString());
        return new List<BsonDocument>();
      } 
    }

    public async Task RemoveEvents(BsonDocument filter) {
      var collection = _db.GetCollection<BsonDocument>("events");
      try {
        await collection.DeleteManyAsync(filter);
        await _hub.Clients.All.SendAsync("NewEvent");
      } catch(Exception e) {
        Console.WriteLine(e.ToString());
        
      } 
    }

    public async Task<bool> AddEvent(BsonDocument data, int userId) {
      try {
        var collection = _db.GetCollection<BsonDocument>("events");
        await collection.InsertOneAsync(data);
        var usersData = new List<string>();
        foreach (var e in NotificationHub.Data) {
          if (e.Id == userId) {
            await _hub.Clients.Client(e.ConnectionId).SendAsync("NewEvent");
          }
        }
      } catch (Exception e) {
        Console.WriteLine(e.ToString());
      }

      
      return true;
    }

    public async Task ReadEvent(string eventId)
    {
      try {
        var collection = _db.GetCollection<BsonDocument>("events");
        var result = await collection.UpdateOneAsync(
          new BsonDocument("_id", new ObjectId(eventId)), 
          new BsonDocument("$set", new BsonDocument("read", true)));
      } catch (Exception e) {
        Console.WriteLine(e.ToString());
      }
    }

    public async Task DeleteEvent(string eventId)
    {
      try {
        var collection = _db.GetCollection<BsonDocument>("events");
        var filter = Builders<BsonDocument>.Filter.Eq("_id", new ObjectId(eventId));
        await collection.DeleteOneAsync(filter);
      } catch (Exception e) {
        Console.WriteLine(e.ToString());
      }
    }
  }
}
