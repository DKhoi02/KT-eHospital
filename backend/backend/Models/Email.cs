namespace backend.Models
{
    public class Email
    {
        public string email_to { get; set; }

        public string email_subject { get; set; }

        public string email_content { get; set;}

        public Email(string email_to, string email_subject, string email_content)
        {
            this.email_to = email_to;
            this.email_subject = email_subject;
            this.email_content = email_content;
        }
    }
}
