using System;
using Web.Entities;
using Web.Models.User;

namespace Web.Models.Project
{
  public class PageResponse
  {
    public int Id { get; set; }
    
    public string Name { get; set; }
    
    public string Content { get; set; }

    public string Data { get; set; }
        
    public int ProjectId { get; set; }
    
    public DateTime Created { get; set; }
    
    public DateTime? Updated { get; set; }

    public bool Draft { get; set; }
    
    public bool Deleted { get; set; }
    
    public bool Important { get; set; }
    
    public int UserId { get; set; }

    public UserResponse? User { get; set; }

    public File[]? Files { get; set; }
        
    public int? ParentId { get; set; }
  }
}