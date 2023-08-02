using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Entities;
using Web.Helpers;
using Web.Models.User;
using Web.Services;

namespace Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class AccountController : BaseController
  {
    private readonly ILogger _logger;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    private readonly IProjectService _projectService;
    private readonly AppSettings _appSettings;
    private readonly IFileService _fileService;

    public AccountController(
      ILogger<AccountController> logger,
      IUserService userService,
      IProjectService projectService,
      IOptions<AppSettings> appSettings,
      IMapper mapper,
      IFileService fileService
    )
    {
      _logger = logger;
      _userService = userService;
      _mapper = mapper;
      _projectService = projectService;
      _appSettings = appSettings.Value;
      _fileService = fileService;
    }

    [HttpPost("authenticate")]
    public ActionResult<AuthenticateResponse> Authenticate(AuthenticateRequest model)
    {
      var response = _userService.Authenticate(model, _userService.IpAddress(Request, HttpContext));
      _userService.SetTokenCookie(Response, response.RefreshToken);
      return Ok(response);
    }

    [HttpPost("refresh-token")]
    public ActionResult<AuthenticateResponse> RefreshToken()
    {
      var refreshToken = Request.Cookies["refreshToken"];
      var response = _userService.RefreshToken(refreshToken, _userService.IpAddress(Request, HttpContext));
      _userService.SetTokenCookie(Response, response.RefreshToken);
      return Ok(response);
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public IActionResult RevokeToken(RevokeTokenRequest model)
    {
      // accept token from request body or cookie
      var token = model.Token ?? Request.Cookies["refreshToken"];

      if (string.IsNullOrEmpty(token))
        return BadRequest(new {message = "Token is required"});

      // users can revoke their own tokens and admins can revoke any tokens
      if (!Account.OwnsToken(token) && Account.Role != Role.Admin)
        return Unauthorized(new {message = "Unauthorized"});

      _userService.RevokeToken(token, _userService.IpAddress(Request, HttpContext));
      return Ok(new {message = "Token revoked"});
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest model)
    {
      //_logger.LogInformation("register", model);
      try
      {
        await _userService.Register(model, _appSettings.ApiOrigin);
      }
      catch (Exception e)
      {
        if (e.Message == "Email already registered")
        {
          return Conflict(new {Email = "Email already registered"});
        }

        _logger.LogError(e.Message);
        return Problem();
      }

      return Ok(new {message = "Registration successful, please check your email for verification instructions"});
    }

    [HttpPost("resend-confirm-email")]
    public async Task<IActionResult> ResendConfirmEmail([FromBody] AuthenticateRequest model)
    {
      var response = await _userService.ResendConfirmEmail(model, _appSettings.ApiOrigin);
      return Ok(response);
    }

    [HttpGet("verify-email")]
    public IActionResult VerifyEmail([FromQuery] string token)
    {
      var user = (User) HttpContext.Items["Account"];
      if (user != null)
      {
        return Redirect(_appSettings.AppOrigin);
      }

      if (_userService.VerifyEmail(token))
      {
        return Redirect(_appSettings.AppOrigin + "/confirm-success");
      }

      return Redirect(_appSettings.AppOrigin);
    }

    [HttpPost("forgot-password")]
    public IActionResult ForgotPassword(ForgotPasswordRequest model)
    {
      _userService.ForgotPassword(model, _appSettings.AppOrigin);
      return Ok(new {message = "Please check your email for password reset instructions"});
    }

    [HttpPost("validate-reset-token")]
    public IActionResult ValidateResetToken(ValidateResetTokenRequest model)
    {
      _userService.ValidateResetToken(model);
      return Ok(new {message = "Token is valid"});
    }

    [HttpPost("reset-password")]
    public IActionResult ResetPassword(ResetPasswordRequest model)
    {
      _userService.ResetPassword(model);
      return Ok(new {message = "Password reset successful, you can now login"});
    }

    [HttpGet("fb")]
    public async Task<IActionResult> Fb([FromQuery] string code, [FromQuery] string redirect_uri)
    {
      if (string.IsNullOrEmpty(code))
        return BadRequest(new {message = "Code is required"});
      if (string.IsNullOrEmpty(redirect_uri))
        return BadRequest(new {message = "Redirect uri is required"});

      var response = await _userService.LoginByFb(code, redirect_uri, _userService.IpAddress(Request, HttpContext));
      if (response == null)
      {
        return BadRequest();
      }

      _userService.SetTokenCookie(Response, response.RefreshToken);
      return Ok(response);
    }


    [HttpGet("vk")]
    public async Task<IActionResult> Vk([FromQuery] string code, [FromQuery] string redirect_uri)
    {
      if (string.IsNullOrEmpty(code))
        return BadRequest(new {message = "Code is required"});
      if (string.IsNullOrEmpty(redirect_uri))
        return BadRequest(new {message = "Redirect uri is required"});

      var response = await _userService.LoginByVk(code, redirect_uri, _userService.IpAddress(Request, HttpContext));
      if (response == null)
      {
        return BadRequest();
      }

      _userService.SetTokenCookie(Response, response.RefreshToken);
      return Ok(response);

    }

    [HttpGet("google")]
    public async Task<IActionResult> Google([FromQuery] string code, [FromQuery] string redirect_uri)
    {
      if (string.IsNullOrEmpty(code))
        return BadRequest(new {message = "Code is required"});
      if (string.IsNullOrEmpty(redirect_uri))
        return BadRequest(new {message = "Redirect uri is required"});

      var response = await _userService.LoginByGoogle(code, redirect_uri, _userService.IpAddress(Request, HttpContext));
      if (response == null)
      {
        return BadRequest();
      }

      _userService.SetTokenCookie(Response, response.RefreshToken);
      return Ok(response);
    }

    [Authorize]
    [HttpGet]
    public ActionResult<UserResponse> GetAccount()
    {
      return Ok(_mapper.Map<UserResponse>(Account));
    }
    
    [Authorize]
    [HttpGet("info")]
    public async Task<ActionResult<UserInfoResponse>> GetInfo(int id)
    {
      var info = await _userService.GetUserInfo(Account);
      return Ok(info);
    }
    
    [Authorize]
    [HttpPut("info")]
    public async Task<ActionResult<UserInfoResponse>> UpdateInfo(int id, [FromForm] UpdateInfoUserRequest model)
    {
      var info = await _userService.GetUserInfo(Account);
      info.City = model.City;
      info.Education = model.Education;
      info.Tags = model.Tags;
      info.Links = model.Links;
      info.Skills = model.Skills;
      info = await _userService.UpdateUserInfo(info);
      
      Account.Name = model.Name;
      Account.Login = model.Login;
      Account.Cover = model.Cover;
      if (model.CoverFile != null)
      {
        Account.Cover = (await _fileService.SaveImage(model.CoverFile, "users")).Path;
      }
      var account = await _userService.UpdateUser(Account);
      return Ok(new
      {
        account = _mapper.Map<UserResponse>(account),
        info,
      });
    }

    [Authorize]
    [HttpGet("projects")]
    public ActionResult GetMyProjects([FromQuery] int? page, [FromQuery] int? type, [FromQuery] int? list)
    {
      var projects = _projectService.GetUserProjects(Account, page, type, list);
      return Ok(projects);
    }
  }
}