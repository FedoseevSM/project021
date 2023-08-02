using System;
using AutoMapper;
using Web.Helpers;
using Web.Entities;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;


namespace Web.Services
{
  public interface IEventsService
  {
    Task<List<BsonDocument>> GetUserEvents(User user);
    Task<bool> RemoveUserEvents(User user);
    Task<Event?> GetEventById(int eventId);
    Task<bool> ReadEvent(Event userEvent);
    Task<bool> RemoveEvent(Event userEvent);
    Task<Event> CreateEvent(User user, string type, string data);

    Task<bool> RemoveEvents(BsonDocument data);
    Task<bool> AddComment(
      Project project,
      int userId, 
      Comment comment, 
      Web.Entities.User user, 
      int? parentUserId,
      int? threadUserId
    );

    Task<bool> LikeComment(Comment comment, Web.Entities.User user);
    Task<bool> LikeProject(Project project, Web.Entities.User user);

    Task<bool> NewRequest(Project project, Web.Entities.User user);

    Task<bool> NewFollowers(Project project, Web.Entities.User user);

    Task<bool> EditPage(Project project, Page page, Web.Entities.User user);

    Task ReadEvent(string eventId);

    Task DeleteEvent(string eventId);

    // Task<bool> AcceptRequest(Project project, Web.Entities.User user);
  }

  public class EventsService : IEventsService
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger _logger;

    private readonly IEventsContext _eventsContext;

    public EventsService(
      DataContext context,
      IMapper mapper,
      ILogger<IEventsService> logger,
      IEventsContext eventsContext
    )
    {
      _context = context;
      _mapper = mapper;
      _logger = logger;
      _eventsContext = eventsContext;
    }

    public async Task<List<BsonDocument>> GetUserEvents(User user)
    {
      var events = await _eventsContext.GetUserEvents(user.Id);
      return events;
    }

    public async Task<bool> RemoveUserEvents(User user)
    {
      var events =
        (from e in _context.Events
        where e.UserId == user.Id
        select e);

      _context.Events.RemoveRange(events);
      await _context.SaveChangesAsync();
      return true;
    }

    public async Task<Event?> GetEventById(int eventId)
    {
      var userEvent = _context.Events.FirstOrDefault(x => x.Id == eventId);
      return userEvent;
    }

    public async Task<bool> ReadEvent(Event userEvent)
    {
      userEvent.Read = DateTime.UtcNow;
      _context.Events.Update(userEvent);
      await _context.SaveChangesAsync();
      return true;
    }

    public async Task<bool> RemoveEvent(Event userEvent)
    {
      _context.Events.Remove(userEvent);
      await _context.SaveChangesAsync();
      return true;
    }

    public async Task<Event> CreateEvent(User user, string type, string data)
    {
      var e = new Event()
      {
        User = user,
        Type = type,
        Data = data,
        Created = DateTime.UtcNow
      };

      _context.Events.Add(e);
      await _context.SaveChangesAsync();
      return e;
    }

    public async Task<bool> RemoveEvents(BsonDocument data)
    {
      await _eventsContext.RemoveEvents(data);
      return true;
    }

    public async Task<bool> AddComment(
      Project project,
      int userId, 
      Comment comment, 
      Web.Entities.User user, 
      int? parentUserId,
      int? threadUserId
    ) {
      var data = new BsonDocument
      {
        { "userId", userId },
        { "type",  "comment" },
        { "created",  DateTime.UtcNow },
        { 
          "meta",
          new BsonDocument
          {
            { 
              "comment", 
              new BsonDocument
              {
                { "id", comment.Id },
                { "parentId", comment.ParentId },
                { "threadId", comment.ThreadId },
              }
            },
            { "projectId", project.Id },
            { "projectName", project.Name },
            { "pageId", comment.PageId },
            { "anonymous", comment.Anonymous == 1 },
            { 
              "user", 
              comment.Anonymous == 1 
                ? new BsonDocument
                  {
                    { "name", "Anonymous"}
                  } 
                : new BsonDocument
                {
                  { "id", user.Id },
                  { "name", user.Name },
                }
            }
          }
        }
      };

      await _eventsContext.AddEvent(data, userId);
      if (parentUserId != null) {
        var parentEvent = new BsonDocument
        {
          { "userId",  parentUserId },
          { "type",  "comment" },
          { "created",  DateTime.UtcNow },
          { 
            "meta",
            new BsonDocument
            {
              { 
                "comment", 
                new BsonDocument
                {
                  { "id", comment.Id },
                  { "parentId", comment.ParentId },
                  { "threadId", comment.ThreadId },
                }
              },
              { "projectId", project.Id },
              { "projectName", project.Name },
              { "pageId", comment.PageId },
              { "anonymous", comment.Anonymous == 1 },
              { 
                "user", 
                comment.Anonymous == 1 
                  ? new BsonDocument
                  {
                    { "name", "Anonymous"}
                  } 
                  : new BsonDocument
                  {
                    { "id", user.Id },
                    { "name", user.Name },
                  }
              }
            }
          }
        };
        await _eventsContext.AddEvent(parentEvent, parentUserId.Value);
      }

      if (threadUserId != null && threadUserId != parentUserId) {
        var parentEvent = new BsonDocument
        {
          { "userId",  threadUserId },
          { "type",  "comment" },
          { "created",  DateTime.UtcNow },
          { 
            "meta",
            new BsonDocument
            {
              { 
                "comment", 
                new BsonDocument
                {
                  { "id", comment.Id },
                  { "parentId", comment.ParentId },
                  { "threadId", comment.ThreadId },
                }
              },
              { "projectId", project.Id },
              { "projectName", project.Name },
              { "pageId", comment.PageId },
              { "anonymous", comment.Anonymous == 1 },
              { 
                "user", 
                comment.Anonymous == 1 
                  ? new BsonDocument
                  {
                    { "name", "Anonymous"}
                  }
                  : new BsonDocument
                  {
                    { "id", user.Id },
                    { "name", user.Name },
                  }
              }
            }
          }
        };
        await _eventsContext.AddEvent(parentEvent, threadUserId.Value);
      }
      
      return true;
    }

    public async Task<bool> LikeComment(Comment comment, Web.Entities.User user) {
      var data = new BsonDocument
      {
        { "userId", comment.UserId },
        { "type",  "likeComment" },
        { "created",  DateTime.UtcNow },
        { 
          "meta",
          new BsonDocument
          {
            { "projectId", comment.ProjectId },
            { "pageId", comment.PageId },
            { "commentId", comment.Id },
            { 
              "user", 
              new BsonDocument
              {
                { "id", user.Id },
                { "name", user.Name },
              }
            }
          }
        }
      };
      await _eventsContext.AddEvent(data, comment.UserId);
      return true;
    }


    public async Task<bool> LikeProject(Project project, Web.Entities.User user) {
      var data = new BsonDocument
      {
        { "userId", project.UserId },
        { "type",  "likeProject" },
        { "created",  DateTime.UtcNow },
        { 
          "meta",
          new BsonDocument
          {
            { "projectId", project.Id },
            { "projectName", project.Name },
            { 
              "user", 
              new BsonDocument
              {
                { "id", user.Id },
                { "name", user.Name },
              }
            }
          }
        }
      };
      await _eventsContext.AddEvent(data, project.UserId);
      return true;
    }


    public async Task<bool> NewRequest(Project project, Web.Entities.User user)
    {
      var data = new BsonDocument
      {
        { "userId", project.UserId },
        { "type",  "newRequest" },
        { "created",  DateTime.UtcNow },
        { 
          "meta",
          new BsonDocument
          {
            { "projectId", project.Id },
            { "projectName", project.Name },
            { 
              "user", 
              new BsonDocument
              {
                { "id", user.Id },
                { "name", user.Name },
              }
            }
          }
        }
      };
      await _eventsContext.AddEvent(data, project.UserId);
      return true;
    }

    public async Task<bool> NewFollowers(Project project, Web.Entities.User user)
    {
      var data = new BsonDocument
      {
        { "userId", project.UserId },
        { "type",  "newFollower" },
        { "created",  DateTime.UtcNow },
        { 
          "meta",
          new BsonDocument
          {
            { "projectId", project.Id },
            { "projectName", project.Name },
            { 
              "user", 
              new BsonDocument
              {
                { "id", user.Id },
                { "name", user.Name },
              }
            }
          }
        }
      };
      await _eventsContext.AddEvent(data, project.UserId);
      return true;
    }

    public async Task<bool> EditPage(Project project, Page page, Web.Entities.User user)
    {
      var data = new BsonDocument
      {
        { "userId", project.UserId },
        { "type",  "editPage" },
        { "created",  DateTime.UtcNow },
        { 
          "meta",
          new BsonDocument
          {
            { "projectId", project.Id },
            { "projectName", project.Name },
            { "pageId", page.Id },
            { 
              "user", 
              new BsonDocument
              {
                { "id", user.Id },
                { "name", user.Name },
              }
            }
          }
        }
      };
      await _eventsContext.AddEvent(data, project.UserId);
      return true;
    }

    public async Task ReadEvent(string eventId)
    {
      await _eventsContext.ReadEvent(eventId);
    }

    public async Task DeleteEvent(string eventId)
    {
      await _eventsContext.DeleteEvent(eventId);
    }
  }
}