using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace Web.Models.Files
{
  public class AddFileRequest
  {
    [Required] public IFormFile File { get; set; }
  }
}