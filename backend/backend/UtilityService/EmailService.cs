using backend.Models;
using MailKit.Net.Smtp;
using MimeKit;

namespace backend.UtilityService
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration) 
        {
            _configuration = configuration;
        }

        public void SendEmail(Email email)
        {
            var emailMessage = new MimeMessage();
            var from = _configuration["EmailSettings:From"];
            emailMessage.From.Add(new MailboxAddress("KT-eHospital", from));
            emailMessage.To.Add(new MailboxAddress(email.email_to, email.email_to));
            emailMessage.Subject = email.email_subject;
            emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = string.Format(email.email_content)
            };

            using(var client = new SmtpClient())
            {
                try
                {
                    client.Connect(_configuration["EmailSettings:SmtpServer"], 465, true);
                    client.Authenticate(_configuration["EmailSettings:From"], _configuration["EmailSettings:Password"]);
                    client.Send(emailMessage);
                } catch (Exception ex) { throw; }
                finally 
                {
                    client.Disconnect(true);
                    client.Dispose();
                }
            }
        }
    }
}
