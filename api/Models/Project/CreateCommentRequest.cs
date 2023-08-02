using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Web.Entities;

namespace Web.Models.Project
{
  public class CreateCommentRequest
  {
    public static List<string> AllowedTypes = new List<string>() { "image/jpeg", "image/jpg", "image/png" };

    public int ProjectId { get; set; }

    #nullable enable
    public int? PageId { get; set; }

    public IFormFile? Image { get; set; }

    public int? ParentId { get; set; }

    public bool? Anonymous { get; set; }
    #nullable disable

    [Required]
    [MinLength(1)]
    public string Text { get; set; }

    [Required]
    public string Data { get; set; }

  }
}