namespace Web.Entities
{
  public class UserProject
  {

    public int Id { get; set; }

    public int ProjectId { get; set; }
    public Project Project { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }
  }
}