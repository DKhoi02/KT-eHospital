namespace backend.Models.Dto
{
    public record ResetPasswordDto
    {
        public string resetPass_email { get; set; }

        public string resetPass_emailToken { get; set; }

        public string resetPass_newPassword { get; set; }

        public string resetPass_confirmPassword { get; set; }
    }
}
