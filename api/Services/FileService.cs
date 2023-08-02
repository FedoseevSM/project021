using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Web.Helpers;

namespace Web.Services
{
  public interface IFileService
  {
    Task<Web.Entities.File> SaveFile(IFormFile image, string path);
    Task<Web.Entities.File> SaveImage(IFormFile image, string path);
  }
  public class FileService : IFileService
  {
    
    private readonly IWebHostEnvironment _env;
    private readonly DataContext _context;

    private readonly string[] imageTypes =
    {
      "image/gif",
      "image/jpeg",
      "image/jpg",
      "image/png"
    };

    public FileService(
      IWebHostEnvironment env,
      DataContext context
    )
    {
      _env = env;
      _context = context;
    }
  
    public async Task<Web.Entities.File> SaveImage(IFormFile image, string path = "")
    {
      if (!imageTypes.Contains(image.ContentType))
      {
        return null;
      }

      return await SaveFile(image, "images/" + path);
      
    }

    public async Task<Web.Entities.File> SaveFile(IFormFile file, string path = "")
    {
      var extension = Path.GetExtension(file.FileName);
      string fileName = $@"{Guid.NewGuid()}{extension}"; 
      string webRootPath = _env.WebRootPath;
      string folderPath = webRootPath + "/" + path;
      if (!Directory.Exists(folderPath))
      {
        Directory.CreateDirectory(folderPath);  
      }
      string filePath = folderPath + "/" + fileName;
      Stream fileStream = new FileStream(filePath, FileMode.Create);
      await file.CopyToAsync(fileStream);
      var result = new Web.Entities.File()
      {
        Deleted = 0,
        Valid = 1,
        Type = file.ContentType,
        Verified = 0,
        Path = path + "/" + fileName,
        Name = file.FileName,
      };
      _context.Files.Add(result);
      await _context.SaveChangesAsync();
      return result;
    }
  }
}