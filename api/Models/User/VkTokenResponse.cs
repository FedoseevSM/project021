namespace Web.Models.User
{
  public class VkTokenResponse
  {
    public string access_token { get; set; }
    public int user_id { get; set; }
    public string email { get; set; }
  }
}