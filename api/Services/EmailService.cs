using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
// using System.Net;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using Web.Helpers;

namespace Web.Services
{
    public interface IEmailService
    {
        Task<bool> Send(string to, string subject, string html, string from = null);
    }

    public class EmailService : IEmailService
    {
        private readonly AppSettings _appSettings;

        public EmailService(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

         public async Task<bool> Send(string to, string subject, string html, string from = null)
        {
            // create message
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(from ?? _appSettings.EmailFrom));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = html };

            // send email
            // var sendGridClient = new SendGrid.SendGridClient(_appSettings.SmtpPass);
            // var fromA = new SendGrid.Helpers.Mail.EmailAddress(from ?? _appSettings.EmailFrom, "from name");
            // var toA = new SendGrid.Helpers.Mail.EmailAddress(to, "to name");
            // var mailMessage = SendGrid.Helpers.Mail.MailHelper.CreateSingleEmail(fromA, toA, subject, html, html);
            // var res = await sendGridClient.SendEmailAsync(mailMessage);
            // Console.WriteLine(res.Body.ToString());
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_appSettings.SmtpHost, _appSettings.SmtpPort, SecureSocketOptions.StartTls);
            // NetworkCredential credential = new NetworkCredential(_appSettings.SmtpUser, _appSettings.SmtpPass);
            await smtp.AuthenticateAsync("apikey", _appSettings.SmtpPass);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            return true;
        }
    }
}