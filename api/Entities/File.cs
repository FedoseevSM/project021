using System;
namespace Web.Entities
{
  public class File
  {
    public int Id { get; set; }

    public string Type { get; set; }

    public int Verified { get; set; }

    public int Valid { get; set; }

    public int Deleted { get; set; }

    public string Name { get; set; }

    public string Path { get; set; }
  }
}
