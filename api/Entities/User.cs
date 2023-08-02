using System;
using System.Collections.Generic;

namespace Web.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        
        public string Login
        { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public Role Role { get; set; }
        public string VerificationToken { get; set; }
        public bool IsVerified => Verified.HasValue || PasswordReset.HasValue;
        public string ResetToken { get; set; }

        #nullable enable
        public DateTime? Verified { get; set; }
        public string? Cover { get; set; }
        #nullable disable

        public DateTime? ResetTokenExpires { get; set; }
        public DateTime? PasswordReset { get; set; }
        public DateTime Created { get; set; }
        public DateTime? Updated { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; }

        public List<Comment> Comments { get; set; }
        public List<Project> Projects { get; set; }

        public bool OwnsToken(string token) 
        {
            return this.RefreshTokens?.Find(x => x.Token == token) != null;
        }
    }
}