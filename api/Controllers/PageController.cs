using Microsoft.AspNetCore.Mvc;
using System;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Web.Helpers;
using Web.Services;

namespace Web.Controllers
{
  [ApiController]
  [Route("(controller")]
  public class PageController : BaseController
  {
    private readonly ILogger _logger;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    private readonly IProjectService _projectService;
    private readonly IPageService _pageService;
    private readonly AppSettings _appSettings;
    private readonly IFileService _fileService;
    
    public PageController(
      ILogger<AccountController> logger,
      IUserService userService,
      IProjectService projectService,
      IOptions<AppSettings> appSettings,
      IMapper mapper,
      IFileService fileService,
      IPageService pageService
    )
    {
      _logger = logger;
      _userService = userService;
      _mapper = mapper;
      _projectService = projectService;
      _appSettings = appSettings.Value;
      _fileService = fileService;
      _pageService = pageService;
    }
    
  }
}