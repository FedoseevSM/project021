using System;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Web.Services;
using Web.Models.Files;

namespace Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class FilesController : BaseController
  {
    private readonly ILogger _logger;
    private readonly IFileService _fileService;

    public FilesController(
      ILogger<AccountController> logger,
      IFileService fileService
    )
    {
      _logger = logger;
      _fileService = fileService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> AddFile([FromForm] AddFileRequest payload)
    {
      var file = await _fileService.SaveFile(payload.File, "");
      return Ok(new {
        url = file.Path,
      });
    }

  }
}