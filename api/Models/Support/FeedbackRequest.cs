using System.ComponentModel.DataAnnotations;
using Web.Validations;

namespace Web.Models.Project
{
    public class FeedbackRequest
    {
        [Required]
        [MaximumDigits(MaximumDigits = 0)]
        [MinLength(3), MaxLength(15)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(60), MaxLength(1500)]
        public string Message { get; set; }
    }
}