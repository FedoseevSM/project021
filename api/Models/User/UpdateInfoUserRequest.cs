using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Web.Models.User
{
  public class UpdateInfoUserRequest
  {
    [Required] [MinLength(1), MaxLength(120)] public string Name { get; set; }
    
    [MinLength(1), MaxLength(120)] public string Login { get; set; }
    
    [MinLength(1), MaxLength(120)] public string City { get; set; }
    
    [MinLength(1), MaxLength(120)] public string Education { get; set; }
    
    public string[] Tags { get; set; }
    public string[] Skills { get; set; }
    public string[] Links { get; set; }

    #nullable enable
    public string? Cover { get; set; }
    public IFormFile? CoverFile { get; set; }
    #nullable disable
  }
}