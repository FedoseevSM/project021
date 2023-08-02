using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace Web.Models.Project
{
  public class CreateProjectRequest
  {
    public static List<string> AllowedTypes = new List<string>() {"image/jpeg", "image/jpg", "image/png"};


    [Required] [MinLength(1), MaxLength(120)] public string Name { get; set; }

    [Required] [MinLength(1), MaxLength(5000)] public string Description { get; set; }

    [Required] [MinLength(1), MaxLength(15000)] public string Content { get; set; }

    [Required] public string Data { get; set; }

    public int Type { get; set; }

    [Required] public IFormFile Cover { get; set; }
    [Required] public bool Draft { get; set; }
  }
}