using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Web.Entities;

namespace Web.Models.Project
{
  public class UpdateProjectPageRequest
  {
    public static List<string> AllowedTypes = new List<string>() {"image/jpeg", "image/jpg", "image/png"};


    [Required] [MinLength(1), MaxLength(120)] public string Name { get; set; }

    [Required] [MinLength(1), MaxLength(15000)] public string Content { get; set; }

    [Required] public string Data { get; set; }

    [Required] public bool Important { get; set; }

    [Required] public bool Draft { get; set; }
    public List<int>? Files { get; set; }

    public List<IFormFile>? NewFiles { get; set; }


  }
}