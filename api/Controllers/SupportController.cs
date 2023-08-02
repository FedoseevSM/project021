using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Web.Helpers;
using Web.Models.Project;
using Web.Services;

namespace Web.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SupportController : BaseController
    {
        private readonly IEmailService _emailService;
        private readonly AppSettings _appSettings;

        public SupportController(
            IEmailService emailService,
            IOptions<AppSettings> appSettings
        )
        {
            _emailService = emailService;
            _appSettings = appSettings.Value;
        }

        [Authorize]
        [HttpPost("mail^")]
        public async Task<IActionResult> SendMail([FromBody] FeedbackRequest model)
        {
            var response = await _emailService.Send(
                from: _appSettings.EmailFrom,
                to: _appSettings.EmailFrom,
                subject: $"Feedback from {model.Name}",
                html: model.Message + $"\n \n Почта для связи: {model.Email}"
                );

            return Ok(response);
        }
    }
}
