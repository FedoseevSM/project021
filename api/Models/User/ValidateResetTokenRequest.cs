using System.ComponentModel.DataAnnotations;

namespace Web.Models.User
{
    public class ValidateResetTokenRequest
    {
        [Required]
        public string Token { get; set; }
    }
}