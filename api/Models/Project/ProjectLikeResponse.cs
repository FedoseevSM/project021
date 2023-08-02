namespace Web.Models.Project
{
    public class ProjectLikeResponse
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public bool Liked { get; set; }
        public int Count { get; set; }
    }
}