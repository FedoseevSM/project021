using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Web.Entities;
using Web.Models.Project;
using Web.Models.User;
using Web.Services;

namespace Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class ProjectsController : BaseController
  {
    private readonly ILogger _logger;
    private readonly IUserService _userService;
    private readonly IProjectService _projectService;
    private readonly IMapper _mapper;
    private readonly IFileService _fileService;

    public ProjectsController(
        ILogger<ProjectsController> logger,
        IUserService userService,
        IProjectService projectService,
        IMapper mapper,
        IFileService fileService
    )
    {
      _logger = logger;
      _userService = userService;
      _projectService = projectService;
      _mapper = mapper;
      _fileService = fileService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<ProjectResponse>> GetAll([FromQuery] int page = 0, [FromQuery] int type = -1, [FromQuery] int user = 0, [FromQuery] string q = "")
    {
      var projects = _projectService.GetAll(Account, page, type, user, q);
      // var page = HttpContext.Request.Query["page"];
      return Ok(projects);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectResponse>> GetById(int id)
    {
      var project = _projectService.GetById(id);
      return Ok(await _projectService.GetResponse(project, Account));
    }

    [Authorize]
    [HttpPost("{id:int}/follow")]
    public async Task<ActionResult> FollowProject(int id, [FromQuery] int value)
    {
      var project = _projectService.GetById(id);
      await _projectService.Follow(project, value, Account);
      return Ok();
    }

    [Authorize]
    [HttpPost("{id:int}/request")]
    public async Task<ActionResult> RequestProject(int id, [FromQuery] int value)
    {
      var project = _projectService.GetById(id);
      await _projectService.Request(project, value, Account);
      return Ok();
    }

    [Authorize]
    [HttpPost("{id:int}/leave")]
    public async Task<ActionResult> LeaveProject(int id)
    {
      var project = _projectService.GetById(id);
      await _projectService.Leave(project, Account);
      return Ok();
    }

    [HttpGet("{id:int}/followers")]
    public async Task<ActionResult<UserResponse[]>> GetProjectFollowers(int id)
    {
      var project = _projectService.GetById(id);
      var users = await _projectService.GetFollowers(project);
      
      return Ok(_mapper.Map<UserResponse[]>(users));
    }

    [HttpGet("{id:int}/users")]
    public async Task<ActionResult<UserResponse[]>> GetProjectUsers(int id)
    {
      var project = _projectService.GetById(id);
      var users = await _projectService.GetUsers(project);
      return Ok(_mapper.Map<UserResponse[]>(users));
    }

    [Authorize]
    [HttpDelete("{id:int}/users/{userId:int}")]
    public async Task<ActionResult> DeleteProjectUser(int id, int userId)
    {
      var project = _projectService.GetById(id);
      if (await _projectService.RemoveUser(project, userId))
      {
        return Ok();
      }
      return NotFound();
    }

    [Authorize]
    [HttpGet("{id:int}/requests")]
    public async Task<ActionResult<UserResponse[]>> GetProjectRequests(int id)
    {
      var project = _projectService.GetById(id);
      if (project.UserId != Account.Id)
      {
        return Unauthorized();
      }
      var users = await _projectService.GetRequests(project);
      return Ok(_mapper.Map<UserResponse[]>(users));
    }

    [Authorize]
    [HttpPost("{id:int}/requests/{userId:int}")]
    public async Task<ActionResult> AcceptUserRequest(int id, int userId)
    {
      var project = _projectService.GetById(id);
      if (project.UserId != Account.Id)
      {
        return Unauthorized();
      }
      if (await _projectService.AcceptRequest(project, userId))
      {
        return Ok();
      }
      return NotFound();
    }

    [Authorize]
    [HttpDelete("{id:int}/requests/{userId:int}")]
    public async Task<ActionResult> DeclineUserRequest(int id, int userId)
    {
      var project = _projectService.GetById(id);
      if (project.UserId != Account.Id)
      {
        return Unauthorized();
      }
      if (await _projectService.DeclineRequest(project, userId))
      {
        return Ok();
      }
      return NotFound();
    }

    [Authorize]
    [HttpDelete("{id:int}/followers/{userId:int}")]
    public async Task<ActionResult> Unfollow(int id, int userId)
    {
      var project = _projectService.GetById(id);
      if (project.UserId != Account.Id)
      {
        return Unauthorized();
      }
      if (await _projectService.UnfollowUser(project, userId))
      {
        return Ok();
      }
      return NotFound();
    }



    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ProjectResponse>> Create([FromForm] CreateProjectRequest model)
    {
      if (!CreateProjectRequest.AllowedTypes.Contains(model.Cover.ContentType))
      {
        return BadRequest(new { message = "{ \"cover\": \"Invalid image type\" }" });
      }
      var project = await _projectService.Create(model, Account);
      return Ok(project);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProjectResponse>> Update(int id, [FromForm] UpdateProjectRequest model)
    {
      var project = _projectService.GetById(id);
      // users can update their own projects and admins can delete any projects
      if (project.UserId != Account.Id && Account.Role != Role.Admin)
        return Unauthorized(new { message = "Unauthorized" });
      project = await _projectService.Update(id, model);
      var res = await _projectService.GetResponse(project, Account);
      return Ok(res);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
      var project = _projectService.GetById(id);
      // users can delete their own project and admins can delete any projects
      if (project.UserId != Account.Id && Account.Role != Role.Admin)
        return Unauthorized(new { message = "Unauthorized" });

      _projectService.Delete(id);
      return Ok(new { message = "Project deleted successfully" });
    }


    [HttpGet("{id:int}/comments")]
    public ActionResult<IEnumerable<CommentResponse>> GetComments(int id, [FromQuery] int? page, [FromQuery] int? positive)
    {
      var project = _projectService.GetById(id);
      var comments = _projectService.GetProjectComments(project, page, positive);
      var data = new List<CommentResponse>();

      if (positive == 1)
      {
        foreach (Comment comment in comments)
        {
          if (comment.PositiveScore - comment.NegativeScore >= 0 && comment.Deleted != 1)
          {
            data.Add(_projectService.GetCommentResponse(comment, Account));
          }

        }
      }
      else
      {
        foreach (Comment comment in comments)
        {
          data.Add(_projectService.GetCommentResponse(comment, Account));
        }
      }
      return Ok(data);
    }

    [Authorize]
    [HttpPost("{id:int}/like")]
    public ActionResult<ProjectLikeResponse> LikeProject(int id)
    {
      var project = _projectService.GetById(id);
      var liked = _projectService.LikeProject(project, Account);
      return Ok(new ProjectLikeResponse()
      {
        ProjectId = project.Id,
        UserId = Account.Id,
        Liked = liked,
        Count = project.LikesCount
      });
    }

    [Authorize]
    [HttpPost("{id:int}/comments")]
    public async Task<ActionResult<CommentResponse>> AddComment(int id, [FromForm] CreateCommentRequest model)
    {
      var project = _projectService.GetById(id);
      var image = "";
      if (model.Image != null)
      {
        image = (await _fileService.SaveImage(model.Image, "comments")).Name;
      }
      var comment = await _projectService.AddCommentToProject(project, model, image, Account);
      return Ok(_projectService.GetCommentResponse(comment, Account));
    }


    [HttpGet("{id:int}/pages")]
    public async Task<ActionResult<List<PageResponse>>> GetPages(int id)
    {
      var project = _projectService.GetById(id);
      // TODO: all pages for owner only
      var pages = await _projectService.GetProjectPages(project, Account);
      var data = new List<PageResponse>();
      foreach (var page in pages)
      {
        data.Add(await _projectService.GetPageResponse(page, false));
      }
      return Ok(data);
    }

    [Authorize]
    [HttpPost("{id:int}/pages")]
    public async Task<ActionResult<PageResponse>> AddPage(int id, [FromQuery] int? parent)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.CreatePage(project, Account, parent);
      // TODO Automapper
      return Ok(await _projectService.GetPageResponse(page, true));
    }

    [HttpGet("{id:int}/pages/{pageId:int}")]
    public async Task<ActionResult<PageResponse>> GetPage(int id, int pageId)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, pageId, Account);
      // TODO Automapper
      return Ok(await _projectService.GetPageResponse(page, Account != null && (Account.Id == page.UserId)));
    }

    [Authorize]
    [HttpPut("{id:int}/pages/{pageId:int}")]
    public async Task<ActionResult> UpdatePage(int id, int pageId, [FromForm] UpdateProjectPageRequest model)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, pageId, Account);
      // if (page.UserId != Account.Id && project.UserId != Account.Id)
      // {
      //   return Unauthorized(new { message = "Unauthorized" });
      // }
      page = await _projectService.UpdateProjectPage(project, page, model, Account);
      // TODO Automapper
      return Ok(await _projectService.GetPageResponse(page, true));
    }

    [Authorize]
    [HttpDelete("{id:int}/pages/{pageId:int}")]
    public async Task<ActionResult<PageResponse>> Delete(int id, int pageId)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, pageId, Account);
      if (page.UserId != Account.Id && project.UserId != Account.Id)
      {
        return Unauthorized(new { message = "Unauthorized" });
      }
      await _projectService.DeleteProjectPage(project, page);
      return Ok(new { message = "Page deleted successfully" });
    }

    [Authorize]
    [HttpGet("{id:int}/pages/{pageid:int}/drafts")]
    public async Task<ActionResult> GetDrafts(int id, int pageid)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, (int)pageid, Account);
      if (page == null) {
        return NotFound();
      }
      // if (project.UserId != Account.Id && ((page == null) || (page.UserId != Account.Id)))
      // {
      //     return Unauthorized(new { message = "Unauthorized" });
      // }
        
      var drafts = await Task.FromResult(_projectService.GetDrafts(page, Account));
      return Ok(new { drafts = drafts });
    }

    [Authorize]
    [HttpPost("{id:int}/pages/{pageid:int}/drafts")]
    public async Task<ActionResult> UpdateDraft(
      int id,
      int pageid,
      [FromForm] string content,
      [FromForm] string data
    )
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, (int)pageid, Account);
      if (page == null) {
        return NotFound();
      }
      // if (project.UserId != Account.Id && ((page == null) || (page.UserId != Account.Id)))
      // {
      //   return Unauthorized(new { message = "Unauthorized" });
      // }
      var drafts = _projectService.GetDrafts(page, Account);
      Draft result = null;
      if (drafts.Length == 0)
      {
        result = await _projectService.CreateDraft(project, page, Account, content, data);
      }
      else
      {
        result = await _projectService.UpdateDraft(drafts.First(), content, data);
      }

      return Ok(result);
    }

    [Authorize]
    [HttpPost("{id:int}/pages/{pageid:int}/drafts/from")]
    public async Task<ActionResult> SaveFromProject(int id, int pageid)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, (int)pageid, Account);
      if (page == null) {
        return NotFound();
      }
      // if (project.UserId != Account.Id && ((page == null) || (page.UserId != Account.Id)))
      // {
      //   return Unauthorized(new { message = "Unauthorized" });
      // }

      var drafts = _projectService.GetDrafts(page, Account);
      Draft result = null;
      if (drafts.Length == 0)
      {
        result = await _projectService.CreateDraft(project, page, Account, "", "");
      }
      else
      {
        result = drafts.First();
      }
      await _projectService.SaveDraftFromProject(page, result);
      return Ok();
    }

    [Authorize]
    [HttpPost("{id:int}/pages/{pageid:int}/drafts/to")]
    public async Task<ActionResult> SaveToProject(int id, int pageid)
    {
      var project = _projectService.GetById(id);
      var page = await _projectService.GetProjectPage(project, (int)pageid, Account);
      if (page == null) {
        return NotFound();
      }
      // if (project.UserId != Account.Id && ((page == null) || (page.UserId != Account.Id)))
      // {
      //   return Unauthorized(new { message = "Unauthorized" });
      // }

      var drafts = _projectService.GetDrafts(page, Account);
      Draft result = null;
      if (drafts.Length == 0)
      {
        result = await _projectService.CreateDraft(project, page, Account, "", "");
      }
      else
      {
        result = drafts.First();
      }
      await _projectService.SaveDraftToProject(page, result);
      return Ok();
    }

  }
}