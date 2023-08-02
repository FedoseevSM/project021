using AutoMapper;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Web.Entities;
using Web.Helpers;
using Web.Models.Project;
using Web.Models.User;
using Web.Hubs;
using MongoDB.Bson;
using System.Text.RegularExpressions;


namespace Web.Services
{
  public interface IProjectService
  {
    IEnumerable<ProjectResponse> GetAll(User? user, int? page, int? type, int? userId, string? q);
    Project GetById(int id);
    Page GetPageById(int id);
    Task<ProjectResponse> GetResponse(Project project, User? user);
    Task<ProjectResponse> Create(CreateProjectRequest model, Web.Entities.User User);
    Task<Project> Update(int id, UpdateProjectRequest model);
    object GetUserProjects(Web.Entities.User user, int? page, int? type, int? listType);
    IEnumerable<Comment> GetProjectComments(Project project, int? pageId, int? positive);
    CommentResponse GetCommentResponse(Comment comment, User? user);
    bool LikeProject(Project project, Web.Entities.User user);
    Task<Comment> AddCommentToProject(Project project, CreateCommentRequest model, string image, Web.Entities.User user);
    Task<Page> CreatePage(Project project, User user, int? parent);
    Task<Page> GetProjectPage(Project project, int pageId, User? user);
    Task<List<Page>> GetProjectPages(Project project, User? user);
    Task<PageResponse> GetPageResponse(Page page, bool owner);
    Task<bool> Follow(Project project, int value, User user);
    Task<bool> Request(Project project, int value, User user);
    Task<bool> Leave(Project project, User user);
    Task<Page> UpdateProjectPage(Project project, Page page, UpdateProjectPageRequest data, User user);
    Task<bool> DeleteProjectPage(Project project, Page page);

    Task<User[]> GetFollowers(Project project);
    Task<User[]> GetUsers(Project project);
    Task<User[]> GetRequests(Project project);
    Task<bool> RemoveUser(Project project, int userId);
    Task<bool> AcceptRequest(Project project, int userId);
    Task<bool> DeclineRequest(Project project, int userId);
    Task<bool> UnfollowUser(Project project, int userId);

    Draft[] GetDrafts(Page page, User user);
    Task<Draft> CreateDraft(Project project, Page? page, User user, string content, string data);
    Task<Draft> UpdateDraft(Draft draft, string content, string data);
    Task<bool> SaveDraftFromProject(Page page, Draft draft);
    Task<bool> SaveDraftToProject(Page page, Draft draft);
    //Task<Draft> GetDraft(int draftId);
    //Task<Draft> UpdateDraft(Draft draft, string content, User user);
    //Task<Draft> SaveDraftFromProject(Draft draft, Project project, Page? page, User user);
    //Task<Draft> SaveDraftToProject(Draft draft, Project project, Page? page, User user);

    void Delete(int id);
  }

  public class ProjectService : IProjectService
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;
    private readonly ILogger _logger;
    private readonly IUserService _userService;
    private readonly IWebHostEnvironment _env;
    private readonly IFileService _fileService;
    private readonly IHubContext<NotificationHub> _hub;
    private readonly IEventsService _eventsService;

    public ProjectService(
        DataContext context,
        IMapper mapper,
        IOptions<AppSettings> appSettings,
        ILogger<ProjectService> logger,
        IUserService userService,
        IWebHostEnvironment env,
        IFileService fileService,
        IHubContext<NotificationHub> hub,
        IEventsService eventsService
    )
    {
      _context = context;
      _mapper = mapper;
      _appSettings = appSettings.Value;
      _logger = logger;
      _userService = userService;
      _env = env;
      _fileService = fileService;
      _hub = hub;
      _eventsService = eventsService;
    }

    public IEnumerable<ProjectResponse> GetAll(User? user, int? page = 0, int? type = -1, int? userId = null, string? q = null)
    {
      var req =
          (from project in _context.Projects
          .Include(p => p.User)
          .Include(p => p.Likes)
          .OrderByDescending(p => p.LikesCount)
          .ThenByDescending(p => p.Created)
            where project.Deleted != 1 
            select project);
      if (userId != null && userId != 0) {
        req = req.Where(x => x.UserId == userId);
      }
      if (type != -1) {
        req = req.Where(x => x.Type == type);
      }
      if (q != null && q != "")
      {
        var replaced = Regex.Replace(q, @"[^0-9a-zA-Zа-яА-Я]", "");
        req = req.Where(x => x.Content.ToLower().Contains(replaced.ToLower()) || x.Name.ToLower().Contains(replaced.ToLower()));
      } else {
        req = req.Where(x => x.Draft != true);
      }
      var projects = req.Skip((page == null ? 0 : (int)page) * 8).Take(8);

      var data = new List<ProjectResponse>();
      foreach (var project in projects)
      {
        data.Add(new ProjectResponse()
        {
          Id = project.Id,
          Name = project.Name,
          Description = project.Description,
          Data = project.Data,
          Cover = project.Cover,
          Type = project.Type,
          LikesCount = project.LikesCount,
          CommentsCount = project.CommentsCount,
          User = _mapper.Map<UserResponse>(project.User),
          Liked = user != null && project.Likes.FindAll(x => x.User == user).Count > 0,
          PageCount = project.PageCount,
          FollowersCount = project.FollowersCount,
          UsersCount = project.UsersCount,
          Draft = project.Draft,
          Created = project.Created,
        });
      }

      // TODO: use AutoMapper
      // return _mapper.Map<List<ProjectResponse>>(projects);
      return data;
    }

    public Project GetById(int id)
    {
      return getProject(id);

    }

    public Page GetPageById(int id)
    {
      return getPage(id);

    }

    public async Task<ProjectResponse> GetResponse(Project project, User? user)
    {
      return new ProjectResponse()
      {
        Id = project.Id,
        Name = project.Name,
        Description = project.Description,
        Content = project.Content,
        Data = project.Data,
        Cover = project.Cover,
        Type = project.Type,
        CommentsCount = project.CommentsCount,
        LikesCount = project.LikesCount,
        User = _mapper.Map<UserResponse>(await _userService.GetById(project.UserId)),
        Liked = user != null && project.Likes.FindAll(x => x.User == user).Count > 0,
        PageCount = project.PageCount,
        Participate = user == null ? false : (_context.UserProjects.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id) != null),
        Following = user == null ? false : (_context.UserFollowings.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id) != null),
        Requested = user == null ? false : (_context.UserProjectRequests.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id) != null),
        FollowersCount = project.FollowersCount,
        UsersCount = project.UsersCount,
        Draft = project.Draft,
        Created = project.Created
      };
    }

    public async Task<ProjectResponse> Create(CreateProjectRequest model, Web.Entities.User User)
    {

      string cover = await saveImage(model.Cover);
      var project = new Project()
      {
        Name = model.Name,
        Data = model.Data,
        User = User,
        Description = model.Description,
        Content = model.Content,
        Created = DateTime.UtcNow,
        Updated = DateTime.UtcNow,
        Cover = cover,
        Type =  model.Type,
        PageCount = 0,
        Draft = model.Draft,
      };

      // save project
      _context.Projects.Add(project);
      _context.SaveChanges();

      // TODO:
      // _hub.Clients.All.SendAsync("ProjectCreated");

      return new ProjectResponse()
      {
        Id = project.Id,
        Name = project.Name,
        Description = project.Description,
        Content = project.Content,
        Data = model.Data,
        Type = project.Type,
        Cover = project.Cover,
        LikesCount = project.LikesCount,
        CommentsCount = project.CommentsCount,
        User = _mapper.Map<UserResponse>(User),
        PageCount = 0,
        FollowersCount = project.FollowersCount,
        UsersCount = project.UsersCount,
        Draft = project.Draft,
        Created = project.Created
      };
    }

    public async Task<Project> Update(int id, UpdateProjectRequest model)
    {
      var project = getProject(id);
      string? cover = null;

      if (model.Cover != null)
      {
        cover = await saveImage(model.Cover);
      }

      project.Name = model.Name;
      project.Description = model.Description;
      project.Content = model.Content;
      project.Created = DateTime.UtcNow;
      project.Updated = DateTime.UtcNow;
      project.Draft = model.Draft;
      project.Data = model.Data;

      if (cover != null)
      {
        project.Cover = cover;
      }

      project.Updated = DateTime.UtcNow;
      _context.Projects.Update(project);
      _context.SaveChanges();
      await _hub.Clients.All.SendAsync("ProjectEdit:" + project.Id);
      return project;
    }

    public void Delete(int id)
    {
      var project = getProject(id);
      project.Deleted = 1;
      _context.Projects.Update(project);
      var comments = _context.Comments.Where(x => x.ProjectId == project.Id).ToList();
      comments.ForEach(c => {
        c.Deleted = 1;
      });
      _context.SaveChangesAsync();
      _eventsService.RemoveEvents(new BsonDocument("meta.projectId", id));
      _hub.Clients.All.SendAsync("ProjectEdit:" + project.Id);
    }

    private Project getProject(int id)
    {
      var project = _context.Projects
          .Include(p => p.Likes)
          .FirstOrDefault(x => x.Id == id);
      if (project == null || project.Deleted == 1) throw new KeyNotFoundException("Project not found");
      return project;
    }

    private Page getPage(int id)
    {
      var page = _context.Pages
          .FirstOrDefault(x => x.Id == id);
      if (page == null || page.Deleted == true) throw new KeyNotFoundException("Page not found");
      return page;
    }

    public object GetUserProjects(Web.Entities.User user, int? page = null, int? type = null, int? listType = null)
    {
      var data = new List<ProjectResponse>();

      if (listType == 1) {
        var req =
          (from record in _context.UserProjects
          .Include(r => r.Project)
          .Include(r => r.Project.User)
          .Include(p => p.Project.Likes)
          where record.User.Id == user.Id
          where record.Project.Deleted != 1
          where record.Project.Draft != true
          select record);
        if (type != -1) {
          req = req.Where(p => p.Project.Type == type);
        }
        var projects = req.Skip((page == null ? 0 : (int)page) * 8).Take(8);
        foreach (var record in projects)
        {
          data.Add(new ProjectResponse()
          {
            Id = record.Project.Id,
            Name = record.Project.Name,
            Description = record.Project.Description,
            Data = record.Project.Data,
            Type = record.Project.Type,
            User = _mapper.Map<UserResponse>(record.Project.User),
            Cover = record.Project.Cover,
            LikesCount = record.Project.LikesCount,
            CommentsCount = record.Project.CommentsCount,
            Liked = record.Project.Likes.FindAll(x => x.UserId == user.Id).Count > 0,
            PageCount = record.Project.PageCount,
            FollowersCount = record.Project.FollowersCount,
            UsersCount = record.Project.UsersCount,
            Created = record.Project.Created
          });
        }

      } else if (listType == 2) {
        var req =
          (from record in _context.UserFollowings
          .Include(r => r.Project)
          .Include(r => r.Project.User)
          .Include(p => p.Project.Likes)
          where record.User.Id == user.Id
          where record.Project.Deleted != 1
          where record.Project.Draft != true
          select record);
        if (type != -1) {
          req = req.Where(p => p.Project.Type == type);
        }
        var projects = req.Skip((page == null ? 0 : (int)page) * 8).Take(8);
        foreach (var record in projects)
        {
          data.Add(new ProjectResponse()
          {
            Id = record.Project.Id,
            Name = record.Project.Name,
            Description = record.Project.Description,
            Data = record.Project.Data,
            User = _mapper.Map<UserResponse>(record.Project.User),
            Type = record.Project.Type,
            Cover = record.Project.Cover,
            LikesCount = record.Project.LikesCount,
            CommentsCount = record.Project.CommentsCount,
            Liked = record.Project.Likes.FindAll(x => x.UserId == user.Id).Count > 0,
            PageCount = record.Project.PageCount,
            FollowersCount = record.Project.FollowersCount,
            UsersCount = record.Project.UsersCount,
            Created = record.Project.Created
          });
        }
      } else {
        var req =
            (from project in _context.Projects
            .Include(p => p.User)
            .Include(p => p.Likes)
            .OrderByDescending(p => p.LikesCount)
            .ThenByDescending(p => p.Created)
              where project.Deleted != 1 
              where (project.UserId == user.Id)
              select project);
        
        if (type != -1) {
          req = req.Where(p => p.Type == type);
        }
        var projects = req.Skip((page == null ? 0 : (int)page) * 8).Take(8);
        foreach (var project in projects)
        {
          data.Add(new ProjectResponse()
          {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Data = project.Data,
            Cover = project.Cover,
            Type = project.Type,
            LikesCount = project.LikesCount,
            CommentsCount = project.CommentsCount,
            User = _mapper.Map<UserResponse>(project.User),
            Liked = user != null && project.Likes.FindAll(x => x.User == user).Count > 0,
            PageCount = project.PageCount,
            FollowersCount = project.FollowersCount,
            UsersCount = project.UsersCount,
            Created = project.Created,
          });
        }

      }
      
      
      // TODO: use AutoMapper
      // return _mapper.Map<List<ProjectResponse>>(projects);
      return data;
      
    }

    public IEnumerable<Comment> GetProjectComments(Project project, int? pageId, int? positive)
    {
      var comments =
                      (from comment in _context.Comments
                      .Include(c => c.User)
                      where comment.ProjectId == project.Id
                      orderby comment.Id descending
                      select comment).AsNoTracking().ToList();
      if (pageId != null)
      {
        return comments.Where(c => c.PageId == pageId);
      }
      return comments.Where(c => c.PageId == null);
    }

    public async Task<Comment> AddCommentToProject(Project project, CreateCommentRequest model, string image, Web.Entities.User user)
    {
      _context.SaveChanges();
      var comment = new Comment()
      {
        Text = model.Text,
        User = user,
        ProjectId = project.Id,
        Data = model.Data,
        PageId = model.PageId,
        Image = image,
        Created = DateTime.UtcNow,
        NegativeScore = 0,
        PositiveScore = 0,
      };
      if (model.Anonymous == true)
      {
        comment.Anonymous = 1;
      }
      _context.Comments.Add(comment);
      _context.SaveChanges();
      if (model.PageId == null)
      {
        project.CommentsCount += 1;
      }
      else
      {
        var page = await GetProjectPage(project, (int)model.PageId, user);
        page.CommentsCount += 1;
      }

      _context.SaveChanges();
      if (user.Id != project.UserId)
      {
        var data = Newtonsoft.Json.JsonConvert.SerializeObject(
          new
          {
            user = new
            {
              id = user.Id,
              name = user.Name,
              cover = user.Cover
            },
            projectId = comment.ProjectId,
            pageId = comment.PageId,
            id = comment.Id,
          });
        var e = new Event()
        {
          UserId = project.UserId,
          Created = DateTime.UtcNow,
          Data = data,
          Type = "comment",
        };
        _context.Events.Add(e);
        // TODO:
        // await _hub.Clients.All.SendAsync("NewEvent", project.UserId);
        await _context.SaveChangesAsync();
      }
      var eventName = "CommentsChanged:" + comment.ProjectId;
      if (comment.PageId != null) {
        eventName = eventName + ":" + comment.PageId;
      }
      await _hub.Clients.All.SendAsync(eventName, user.Id);

      return comment;
    }

    public CommentResponse GetCommentResponse(Comment comment, User? user)
    {
      var res = new CommentResponse()
      {
        Id = comment.Id,
        ParentId = comment.ParentId,
        Anonymous = comment.Anonymous == 1,
        Text = comment.Text,
        Data = comment.Data,
        PageId = comment.PageId,
        ProjectId = comment.ProjectId,
        Created = comment.Created,
        Image = comment.Image,
        AnswersCount = comment.AnswersCount,
        NegativeScore = comment.NegativeScore,
        PositiveScore = comment.PositiveScore,
        User = _mapper.Map<UserResponse>(comment.User),
        Liked = user != null && _context.CommentLikes.FirstOrDefault(x => x.Comment == comment && x.User == user) == null,
        Deleted = comment.Deleted == 1,
      };

      if ((user == null || (comment.User.Id != user.Id)) && comment.Anonymous != 1)
      {
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

    public bool LikeProject(Project project, Web.Entities.User user)
    {
      var likes = (
          from like in _context.ProjectLikes
          where (like.ProjectId == project.Id) && (like.UserId == user.Id)
          select like
      ).ToList();
      var hasLikes = likes.Count > 0;
      if (hasLikes)
      {
        _context.ProjectLikes.Remove(likes[0]);
        project.LikesCount -= 1;
        _context.Projects.Update(project);
        _context.SaveChanges();
        _hub.Clients.All.SendAsync("ProjectEdit:" + project.Id);
        return false;
      }
      _context.ProjectLikes.Add(
          new ProjectLike()
          {
            ProjectId = project.Id,
            Project = project,
            UserId = user.Id,
            User = user,
          }
          );
      project.LikesCount += 1;
      _context.Projects.Update(project);
      _context.SaveChanges();
      _hub.Clients.All.SendAsync("ProjectEdit:" + project.Id);
      if (project.UserId != user.Id) {
        _eventsService.LikeProject(project, user);
      }
      return true;
    }

    public async Task<Page> CreatePage(Project project, User user, int? parent)
    {
      if ((user.Id != project.UserId && (_context.UserProjects.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id)) == null))
      {
        throw new UnauthorizedAccessException("You don't have enough rights");
      }
      var page = new Page()
      {
        Project = project,
        Name = "New page",
        Content = "",
        Created = DateTime.UtcNow,
        Deleted = false,
        Draft = true,
        Data = "",
        Important = false,
        User = user,
        ParentId = parent
      };
      await _context.Pages.AddAsync(page);
      await _context.SaveChangesAsync();
      return page;
    }

    public async Task<List<Page>> GetProjectPages(Project project, User? user)
    {
      var pages = (
        from d in _context.Pages
        .Include(d => d.User)
        where d.ProjectId == project.Id && d.Deleted == false
        select new Page
        {
          Id = d.Id,
          ProjectId = d.ProjectId,
          ParentId = d.ParentId,
          UserId = d.UserId,
          User = d.User,
          Name = d.Name,
          Data = d.Data,
          Created = d.Created,
          Updated = d.Updated,
          Deleted = d.Deleted,
          Draft = d.Draft,
          Important = d.Important,
          Content = d.Content,
        }
      ).AsNoTracking().ToList();
      if (user == null || (user.Id != project.UserId && (_context.UserProjects.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id)) == null))
      {
        pages = pages.Where(x => !x.Draft).ToList();
      }
      return pages;
    }

    public async Task<Page> GetProjectPage(Project project, int pageId, User? user)
    {
      var page = _context.Pages
          .Include(d => d.User)
          .SingleOrDefault(x => x.Id == pageId && x.ProjectId == project.Id && x.Deleted == false);
      if (page == null || (page.Draft && (user == null || (project.UserId != user.Id && (_context.UserProjects.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id)) == null))))
      {
        throw new KeyNotFoundException("Page not found");
      }
      return page;
    }

    public async Task<PageResponse> GetPageResponse(Page page, bool owner)
    {
      var res = new PageResponse()
      {
        Id = page.Id,
        Name = page.Name,
        Content = page.Content,
        Data = page.Data,
        ProjectId = page.ProjectId,
        Created = page.Created,
        Updated = page.Updated,
        Draft = page.Draft,
        Deleted = page.Deleted,
        Important = page.Important,
        UserId = page.UserId,
        ParentId = page.ParentId,
        Files = new Web.Entities.File[] { },
      };

      if (page.User != null)
      {
        res.User = new UserResponse()
        {
          Id = page.User.Id,
          Cover = page.User.Cover,
          Name = page.User.Name,
        };
      }

      if (page.Files != null)
      {
        var files = from file in _context.Files
                    where page.Files.Contains(file.Id) && (owner || (file.Valid == 1))
                    select file;
        res.Files = files.AsNoTracking().ToArray();
      }

      return res;
    }

    public async Task<Page> UpdateProjectPage(Project project, Page page, UpdateProjectPageRequest data, User user)
    {
      page.Content = data.Content;
      page.Name = data.Name;
      page.Important = data.Important;
      page.Draft = data.Draft;
      page.Data = data.Data;
      page.Updated = DateTime.UtcNow;
      page.Files = data.Files != null ? data.Files.ToArray() : new int[] { };

      var files = new Web.Entities.File[] { };

      if (data.NewFiles != null && data.NewFiles.Count() > 0)
      {
        foreach (var f in data.NewFiles)
        {
          var file = await _fileService.SaveFile(f, "files");
          files = files.Append(file).ToArray();
        }
      }

      foreach (var f in files)
      {
        page.Files = page.Files.Append(f.Id).ToArray();
      }

      _context.Pages.Update(page);
      await _context.SaveChangesAsync();
      var count = (from d in _context.Pages
                    where d.ProjectId == project.Id && d.Deleted == false && d.Draft != true
                    select new Page
                    {
                      Id = d.Id,
                    }
          ).Count();
      project.PageCount = count;
      _context.Projects.Update(project);
      await _context.SaveChangesAsync();
      await _hub.Clients.All.SendAsync("PageEdit:" + page.Id, page.Content);
      if (project.UserId != user.Id) {
        await _eventsService.EditPage(project, page, user);
      }
      return page;
    }

    public async Task<bool> DeleteProjectPage(Project project, Page page)
    {
      page.Deleted = true;
      _context.Pages.Update(page);
      await _context.SaveChangesAsync();
      var count = (from d in _context.Pages
                   where d.ProjectId == project.Id && d.Deleted == false && d.Draft != true
                   select new Page
                   {
                     Id = d.Id,
                   }
          ).Count();
      project.PageCount = count;
      _context.Projects.Update(project);
      await _context.SaveChangesAsync();
      return true;
    }

    private async Task<string> saveImage(IFormFile image)
    {
      string fileName = $@"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
      string webRootPath = _env.WebRootPath;
      string folderPath = webRootPath + "/images";
      if (!Directory.Exists(folderPath))
      {
        Directory.CreateDirectory(folderPath);
      }
      string filePath = folderPath + "/" + fileName;
      using (Stream fileStream = new FileStream(filePath, FileMode.Create))
      {
        await image.CopyToAsync(fileStream);
      }
      return fileName;
    }

    public async Task<bool> Follow(Project project, int value, User user)
    {
      var record = _context.UserFollowings.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id);
      if (value == 1)
      {
        if (record == null)
        {
          record = new UserFollowing()
          {
            UserId = user.Id,
            ProjectId = project.Id,
          };
          _context.UserFollowings.Add(record);
          project.FollowersCount += 1;
          _context.Projects.Update(project);
          await _eventsService.NewFollowers(project, user);
          await _context.SaveChangesAsync();
        }
        return true;
      }
      else
      {
        if (record != null)
        {
          _context.UserFollowings.Remove(record);
          project.FollowersCount -= 1;
          _context.Projects.Update(project);
          await _context.SaveChangesAsync();
        }
        return false;
      }
    }

    public async Task<bool> Request(Project project, int value, User user)
    {
      var record = _context.UserProjectRequests.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id);
      if (value == 1)
      {
        if (record == null)
        {
          record = new UserProjectRequest()
          {
            UserId = user.Id,
            ProjectId = project.Id,
          };
          _context.UserProjectRequests.Add(record);
          await _context.SaveChangesAsync();
          var data = Newtonsoft.Json.JsonConvert.SerializeObject(
            new
            {
              user = new
              {
                id = user.Id,
                name = user.Name,
                cover = user.Cover
              },
              projectId = project.Id,
              id = project.Id,
            }
          );
          await _eventsService.NewRequest(project, user);
          await _context.SaveChangesAsync();
        }
        return true;
      }
      else
      {
        if (record != null)
        {
          _context.UserProjectRequests.Remove(record);
          await _context.SaveChangesAsync();
        }
        return false;
      }
    }

    public async Task<bool> Leave(Project project, User user)
    {
      var record = _context.UserProjects.FirstOrDefault(x => x.UserId == user.Id && x.ProjectId == project.Id);
      if (record != null)
      {
        _context.UserProjects.Remove(record);
        project.UsersCount -= 1;
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
        return true;
      }
      return false;
    }

    public async Task<User[]> GetFollowers(Project project)
    {
      var followers = (from follower in _context.UserFollowings
                       .Include(f => f.User)
                       where follower.ProjectId == project.Id
                       select follower.User).AsNoTracking().ToArray();
      return followers;
    }

    public async Task<User[]> GetUsers(Project project)
    {
      var users = (from follower in _context.UserProjects
                 .Include(f => f.User)
                   where follower.ProjectId == project.Id
                   select follower.User).AsNoTracking().ToArray();
      return users;
    }

    public async Task<User[]> GetRequests(Project project)
    {
      var users = (from follower in _context.UserProjectRequests
                 .Include(f => f.User)
                   where follower.ProjectId == project.Id
                   select follower.User).AsNoTracking().ToArray();
      return users;
    }

    public async Task<bool> RemoveUser(Project project, int userId)
    {
      var record = await _context.UserProjects.FirstOrDefaultAsync(x => x.UserId == userId);
      if (record == null)
      {
        return false;
      }
      _context.UserProjects.Remove(record);
      project.UsersCount -= 1;
      _context.Projects.Update(project);
      await _context.SaveChangesAsync();
      return true;
    }

    public async Task<bool> AcceptRequest(Project project, int userId)
    {
      var record = await _context.UserProjectRequests.FirstOrDefaultAsync(x => x.UserId == userId && x.ProjectId == project.Id);
      if (record == null)
      {
        return false;
      }
      _context.UserProjectRequests.Remove(record);
      var user = new UserProject()
      {
        ProjectId = record.ProjectId,
        UserId = record.UserId
      };
      _context.UserProjects.Add(user);
      project.UsersCount += 1;
      _context.Projects.Update(project);
      await _context.SaveChangesAsync();
      var data = Newtonsoft.Json.JsonConvert.SerializeObject(
        new
        {
          projectId = project.Id,
          projectName = project.Name,
        }
      );
      var e = new Event()
      {
        UserId = userId,
        Created = DateTime.UtcNow,
        Data = data,
        Type = "acceptRequest",
      };
      _context.Events.Add(e);
      // TODO:
      // await _hub.Clients.All.SendAsync("NewEvent", userId);
      await _context.SaveChangesAsync();
      return true;
    }

    public async Task<bool> DeclineRequest(Project project, int userId)
    {
      var record = await _context.UserProjectRequests.FirstOrDefaultAsync(x => x.UserId == userId && x.ProjectId == project.Id);
      if (record == null)
      {
        return false;
      }

      _context.UserProjectRequests.Remove(record);
      await _context.SaveChangesAsync();
      return true;
    }

    public async Task<bool> UnfollowUser(Project project, int userId)
    {
      var record = _context.UserFollowings.FirstOrDefault(x => x.UserId == userId && x.ProjectId == project.Id);

      if (record == null)
      {
        return false;
      }
      project.FollowersCount -= 1;
      _context.Projects.Update(project);
      _context.UserFollowings.Remove(record);
      await _context.SaveChangesAsync();
      return true;
    }

    public Draft[] GetDrafts(Page page, User user)
    {
      var request = _context.PageDrafts
        .Include(i => i.Draft)
        .Where(i => i.UserId == user.Id)
        .Where(i => i.PageId == page.Id);

      if (page != null)
      {
        request = request.Where(i => i.PageId == page.Id);
      }

      var drafts = request.ToArray().Select(i => i.Draft).ToArray();
      return drafts;
    }

    public async Task<Draft> CreateDraft(Project project, Page? page, User user, string content, string data)
    {
      var draft = new Draft()
      {
        Content = content,
        Data = data,
        Created = DateTime.Now,
        Updated = DateTime.Now,
      };
      await _context.Drafts.AddAsync(draft);
      await _context.SaveChangesAsync();
      var record = new PageDraft()
      {
        Draft = draft,
        Project = project,
        Page = page,
        User = user,
        Tag = DateTime.Now.ToShortDateString(),
        Name = DateTime.Now.ToShortDateString(),
      };
      await _context.PageDrafts.AddAsync(record);
      await _context.SaveChangesAsync();
      return draft;
    }

    public async Task<Draft> UpdateDraft(Draft draft, string content, string data)
    {
      var model = _context.Drafts
        .FirstOrDefault(x => x.Id == draft.Id);
      model.Content = content;
      model.Data = data;
      _context.Drafts.Update(model);
      await _context.SaveChangesAsync();
      return model;
    }

    public async Task<bool> SaveDraftFromProject(Page page, Draft draft)
    {
      draft.Content = page.Content;
      draft.Data = page.Data;
      _context.Drafts.Update(draft);
      await _context.SaveChangesAsync();
      return true;
    }
    public async Task<bool> SaveDraftToProject(Page page, Draft draft)
    {
      page.Content = draft.Content;
      page.Data = draft.Data;
      _context.Pages.Update(page);
      await _context.SaveChangesAsync();
      await _hub.Clients.All.SendAsync("PageEdit:" + page.Id, page.Content);
      return true;
    }
  }
}