using System.ComponentModel.DataAnnotations;
using Web.Validations;

namespace Web.Models.User
{
    public class RegisterRequest
    {
        public RegisterRequest()
        {
            
        }

        [Required]
        [MinLength(3), MaxLength(30)]
        [MaximumDigits(MaximumDigits = 20)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8), MaxLength(20)]
        public string Password { get; set; }
        
    }
}