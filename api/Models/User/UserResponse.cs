using System;

namespace Web.Models.User
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Login { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        #nullable enable
        public string? Cover { get; set; }
        #nullable disable
        public DateTime Created { get; set; }
        public DateTime? Updated { get; set; }
        public bool IsVerified { get; set; }
    }
}