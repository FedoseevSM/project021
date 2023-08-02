using System.ComponentModel.DataAnnotations;

namespace Web.Models.User
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}