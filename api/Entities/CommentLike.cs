namespace Web.Entities
{
    public class CommentLike
    {
        public int Id { get; set; }
        public int CommentId { get; set; }
        public Comment Comment { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; }
        
        public int Type { get; set; }
        
    }
}