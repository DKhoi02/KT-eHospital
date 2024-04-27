using backend.Models;

namespace backend.UtilityService
{
    public interface IEmailService
    {
        void SendEmail(Email email);
    }
}
