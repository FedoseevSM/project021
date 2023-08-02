using System.ComponentModel.DataAnnotations;

namespace Web.Models.User
{
    public class VerifyEmailRequest
    {
        [Required]
        public string Token { get; set; }
    }
}