using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
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
  public class CommentsController : BaseController
  {
    private readonly ILogger _logger;
    private readonly ICommentService _commentService;
    private readonly IMapper _mapper;

    public CommentsController(
        ILogger<AccountController> logger,
        ICommentService commentService,
        IMapper mapper)
    {
      _logger = logger;
      _commentService = commentService;
      _mapper = mapper;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentResponse>> CreateComment([FromForm] CreateCommentRequest model)
    {
      var comment = await _commentService.AddComment(model, Account);
      return Ok(_commentService.GetCommentResponse(comment, Account));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
      // users can delete their own user and admins can delete any user
      var comment = _commentService.GetById(id);
      if (comment == null || comment.Deleted == 1)
      {
        return NotFound(new { message = "Comment not found" });
      }
      if (comment.UserId != Account.Id && Account.Role != Role.Admin)
        return Unauthorized(new { message = "Unauthorized" });
      await _commentService.Delete(comment);

      return Ok(new { message = "Comment deleted successfully" });
    }

    [Authorize]
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<CommentResponse>> Update(int id, [FromForm] CreateCommentRequest model)
    {

      var comment = _commentService.GetById(id);
      if (comment == null || comment.Deleted == 1)
      {
        return NotFound(new { message = "Comment not found" });
      }
      if (comment.UserId != Account.Id)
        return Unauthorized(new { message = "Unauthorized" });

      comment = await _commentService.Update(comment, model);

      return Ok(new CommentResponse()
      {
        Id = comment.Id,
        Image = comment.Image,
        Text = comment.Text,
        Created = comment.Created,
        ParentId = comment.ParentId,
        PageId = comment.PageId,
        ProjectId = comment.ProjectId,
        AnswersCount = comment.AnswersCount,
        NegativeScore = comment.NegativeScore,
        PositiveScore = comment.PositiveScore,
        User = _mapper.Map<UserResponse>(comment.User)
      });

    }

    [Authorize]
    [HttpPost("{id:int}/answers")]
    public async Task<ActionResult<CommentResponse>> CreateAnswer(int id, [FromForm] CreateCommentRequest model)
    {

      var comment = _commentService.GetById(id);
      var answer = await _commentService.AddAnswer(comment, Account, model);

      var res = new CommentResponse()
      {
        Id = answer.Id,
        ParentId = answer.ParentId,
        Text = answer.Text,
        PageId = answer.PageId,
        ProjectId = answer.ProjectId,
        Created = answer.Created,
        Image = answer.Image,
        AnswersCount = answer.AnswersCount,
        NegativeScore = answer.NegativeScore,
        PositiveScore = answer.PositiveScore,
        User = _mapper.Map<UserResponse>(answer.User),
        Liked = false,
      };
      if (answer.Anonymous != null && answer.Anonymous == 1)
      {
        res.Anonymous = true;
        res.User = null;
        res.UserId = 0;
      }
      else
      {
        res.Anonymous = false;
      }
      return Ok(res);

    }

    [Authorize]
    [HttpPost("{id:int}/like")]
    public async Task<ActionResult> LikeComment(int id, [FromQuery] int type)
    {
      var comment = _commentService.GetById(id);
      comment = await _commentService.LikeComment(comment, Account, type);
      return Ok(new
      {
        NegativeScore = comment.NegativeScore,
        PositiveScore = comment.PositiveScore
      });
    }


    [HttpGet]
    public async Task<ActionResult<List<CommentResponse>>> GetComments([FromQuery] int? positive, [FromQuery] int? project, int? page, [FromQuery]  int? comment, [FromQuery]  int? user, [FromQuery] DateTime? after, [FromQuery] DateTime? before)
    {
      var comments = await _commentService.GetComments(positive == 1, project, page, comment, user);
      var data = new List<CommentResponse>();

      foreach (var c in comments)
      {
        data.Add(_commentService.GetCommentResponse(c, Account));
      }
      return Ok(data);
    }

  }
}
