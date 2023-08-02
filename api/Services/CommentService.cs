using AutoMapper;
using System;
using System.Linq;
using System.Threading.Tasks;
using Web.Entities;
using Web.Helpers;
using Web.Models.Project;
using Web.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;

namespace Web.Services
{
  public interface ICommentService
  {
    Task<List<Comment>> GetComments(bool positive, int? projectId, int? pageId, int? commentId, int? userId);

    Comment? GetById(int id);

    Task<bool> Delete(Comment comment);

    Task<Comment> AddAnswer(Comment comment, User user, CreateCommentRequest model);

    Task<Comment> Update(Comment comment, CreateCommentRequest data);

    Task<Comment> LikeComment(Comment comment, User user, int type);

    Task<Comment> AddComment(CreateCommentRequest model, Web.Entities.User user);

    CommentResponse GetCommentResponse(Comment comment, Web.Entities.User? user);
  }

  public class CommentService : ICommentService
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    private readonly IFileService _fileService;
    private readonly IProjectService _projectService;

    private readonly IEventsService _eventsService;

    private readonly IHubContext<NotificationHub> _hub;

    public CommentService(
      DataContext context,
      IMapper mapper,
      IFileService fileService,
      IProjectService projectService,
      IHubContext<NotificationHub> hub,
      IEventsService eventsService
    )
    {
      _context = context;
      _mapper = mapper;
      _fileService = fileService;
      _hub = hub;
      _projectService = projectService;
      _eventsService = eventsService;
    }

    public async Task<List<Comment>> GetComments(bool positive, int? projectId, int? pageId, int? commentId, int? userId)
    {
      var request = _context.Comments
        .Include(x => x.User)
        .AsNoTracking();
        // .Where(x => x.ProjectId == projectId)
        // .Where(x => x.Deleted != 1)
        // .Where(x => x.PageId == pageId);
        //.Where(x => x.ThreadId == commentId);
      if (projectId != null) {
        request = request.Where(x => x.ProjectId == projectId);
      }

      if (pageId != null) {
        request = request.Where(x => x.PageId == pageId);
      }

      if (userId != null && userId != 0) {
        request = request.Where(x => x.UserId == userId && x.Anonymous != 1);
      }

      // TODO: before/after params

      var data = await Task.FromResult(request.ToList());
      return data;
    }

    public Comment GetById(int id)
    {
      var comment = _context.Comments
        .FirstOrDefault(x => x.Id == id);
      if (comment == null) throw new KeyNotFoundException("Comment not found");
      return comment;
    }

    public CommentResponse GetCommentResponse(Comment comment, Web.Entities.User? user)
    {
      var res = new CommentResponse()
      {
        Id = comment.Id,
        Text = comment.Deleted == 1 ? "" : comment.Text,
        Anonymous = comment.Anonymous == 1,
        ParentId = comment.ParentId,
        Depth = comment.Depth,
        ThreadId = comment.ThreadId,
        Created = comment.Created,
        Data = comment.Data,
        ProjectId = comment.ProjectId,
        PageId = comment.PageId,
        AnswersCount = comment.AnswersCount,
        PositiveScore = comment.PositiveScore,
        NegativeScore = comment.NegativeScore,
        Deleted = comment.Deleted == 1,
      };

      if (comment.Anonymous == 1 && user != null && (comment.UserId != user.Id))
      {
        
      } else {
        res.User = new Models.User.UserResponse()
        {
          Id = comment.User.Id,
          Name = comment.User.Name,
          Cover = comment.User.Cover,
        };
        res.UserId = comment.UserId;
      }
      return res;
    }

    public async Task<Comment> AddComment(CreateCommentRequest model, Web.Entities.User user)
    {
      var project = _projectService.GetById(model.ProjectId);

      var comment = new Comment()
      {
        Project = project,
        User = user,
        Text = model.Text,
        Data = model.Data,
        Created = DateTime.UtcNow,
        Depth = 0,
        NegativeScore = 0,        
        PositiveScore = 0,
        Anonymous = model.Anonymous == true ? 1 : 0,
      };

      // if (model.Anonymous != null) {
      //   comment.Anonymous = mo
      // }

      if (model.ParentId != null)
      {
        var parent = GetById(model.ParentId.Value);
        comment.ParentId = model.ParentId;
        comment.ThreadId = parent.ThreadId != null ? parent.ThreadId : parent.Id;
        if (comment.ParentId != comment.ThreadId)
        {
          var threadComment = GetById(comment.ThreadId.Value);
          threadComment.AnswersCount += 1;
          _context.Comments.Update(threadComment);
        }
        parent.AnswersCount += 1;
        _context.Comments.Update(parent);
        comment.Depth = parent.Depth + 1;
        if (parent.Id != comment.ThreadId) {
          var thread = _context.Comments.SingleOrDefault(x => x.Id == comment.ThreadId);
          if (thread != null) {
            thread.AnswersCount += 1;
            _context.Comments.Update(thread);
          }
        }
      }
      await _context.Comments.AddAsync(comment);
      await _context.SaveChangesAsync();

      if (model.PageId != null)
      {
        var page = _projectService.GetPageById(model.PageId.Value);
        comment.Page = page;
        page.CommentsCount += 1;
        if (page.UserId != comment.UserId) {
          await _eventsService.AddComment(project, page.UserId, comment, user, null, null);
        }
        _context.Pages.Update(page);
      } else
      {
        if (project.UserId != comment.UserId) {
          await _eventsService.AddComment(project, project.UserId, comment, user, null, null);
        }
        project.CommentsCount += 1;
        _context.Projects.Update(project);
      }

      await _context.SaveChangesAsync();
      
      return comment;
    }


    public async Task<bool> Delete(Comment comment)
    {
      comment.Deleted = 1;
      _context.Comments.Update(comment);
      var project = await Task.FromResult(_context.Projects.FirstOrDefault(x => x.Id == comment.ProjectId));
      var deletedCount = 1;
      if (comment.ParentId == null || comment.ParentId == 0)
      {
        //var answers = _context.Comments.Where(x => x.ParentId == comment.Id && x.Deleted != 1).ToList();
        //deletedCount += answers.Count();
        //answers.ForEach(x => x.Deleted = 1);
        //_context.Comments.UpdateRange(answers);
      }
      else
      {
        var parent = _context.Comments.SingleOrDefault(x => x.Id == comment.ParentId);
        if (parent != null)
        {
          parent.AnswersCount -= 1;
          _context.Comments.Update(parent);
          await _context.SaveChangesAsync();
          if (parent.Id != comment.ThreadId) {
            var thread = _context.Comments.SingleOrDefault(x => x.Id == comment.ThreadId);
            if (thread != null) {
              thread.AnswersCount -= 1;
              _context.Comments.Update(thread);
              await _context.SaveChangesAsync();
            }
          }
          
        }
      }

      if (comment.PageId == null)
      {
        project.CommentsCount -= deletedCount;
        _context.Projects.Update(project);
      }
      else
      {
        var page = _context.Pages
          .SingleOrDefault(x => x.Id == comment.PageId && x.ProjectId == project.Id);
        if (page != null)
        {
          page.CommentsCount -= deletedCount;
          _context.Pages.Update(page);
        }

      }
      await _context.SaveChangesAsync();

      _eventsService.RemoveEvents(new BsonDocument("meta.comment.id", comment.Id));

      return true;
    }

    public async Task<Comment> AddAnswer(Comment comment, User user, CreateCommentRequest model)
    {
      var image = "";
      if (model.Image != null)
      {
        image = (await _fileService.SaveImage(model.Image, "comments")).Name;
      }

      var answer = new Comment()
      {
        Deleted = 0,
        ProjectId = comment.ProjectId,
        Image = image,
        User = user,
        UserId = user.Id,
        Text = model.Text,
        Data = model.Data,
        ParentId = comment.Id,
        ThreadId = comment.ParentId == null ? comment.Id : comment.ThreadId,
        NegativeScore = 0,
        PositiveScore = 0,
        Created = DateTime.UtcNow,
        Anonymous = model.Anonymous == true ? 1 : 0,
      };

      
      
      await _context.Comments.AddAsync(answer);
      await _context.SaveChangesAsync();

      comment.AnswersCount += 1;
      _context.Update(comment);
      await _context.SaveChangesAsync();
      var project = await Task.FromResult(_context.Projects.SingleOrDefault(x => x.Id == answer.ProjectId));
      if (project != null)
      {
        project.CommentsCount += 1;
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
      }
      if (user.Id != project.UserId)
      {
        var threadComment = GetById(answer.ThreadId.Value);
        await _eventsService.AddComment(project, comment.UserId, answer, user, comment.UserId, threadComment.UserId);
      }
      
      var eventName = "CommentsChanged:" + project.Id;
      if (model.PageId != null) {
        eventName = eventName + ":" + model.PageId;
      }
      await _hub.Clients.All.SendAsync(eventName, user.Id);
      
      return answer;
    }

    public async Task<Comment> LikeComment(Comment comment, User user, int type)
    {
      var like = await Task.FromResult(_context.CommentLikes.SingleOrDefault(
        x => x.UserId == user.Id && x.CommentId == comment.Id
      ));
      if (like == null)
      {
        like = new CommentLike()
        {
          User = user,
          Comment = comment,
          Type = type
        };
        _context.CommentLikes.Add(like);
        await _context.SaveChangesAsync();
        if (type == 2)
        {
          comment.NegativeScore += 1;
        }
        else if (type == 1)
        {
          comment.PositiveScore += 1;
        }
      }
      else
      {
        if (like.Type != type)
        {
          _context.CommentLikes.Add(
            new CommentLike()
            {
              User = user,
              Comment = comment,
              Type = type
            }
          );
          if (user.Id != comment.UserId) {
            await _eventsService.LikeComment(comment, user);
          }
          
          if (type == 2)
          {
            comment.NegativeScore += 1;
            comment.PositiveScore -= 1;
          }
          else if (type == 1)
          {
            comment.PositiveScore += 1;
            comment.NegativeScore -= 1;
          }
        }
        else
        {
          if (type == 2)
          {
            comment.NegativeScore -= 1;
          }
          else if (type == 1)
          {
            comment.PositiveScore -= 1;
          }
        }
        _context.CommentLikes.Remove(like);
        await _context.SaveChangesAsync();
      }

      _context.Comments.Update(comment);
      await _context.SaveChangesAsync();
      return comment;
    }

    public async Task<Comment> Update(Comment comment, CreateCommentRequest data)
    {
      comment.Text = data.Text;
      comment.Data = data.Data;
      _context.Update(comment);
      await _context.SaveChangesAsync();
      var eventName = "CommentsChanged:" + comment.ProjectId;
      if (comment.PageId != null) {
        eventName = eventName + ":" + comment.PageId;
      }
      await _hub.Clients.All.SendAsync(eventName, comment.UserId);
      return comment;
    }

  }

}