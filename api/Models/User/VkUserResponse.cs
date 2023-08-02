namespace Web.Models.User
{
  public class VkUserResponse
  {
    public VkUser[] response { get; set; }
  }

  public class VkUser
  {
    public string first_name { get; set; }
    public string last_name { get; set; }
  }
}