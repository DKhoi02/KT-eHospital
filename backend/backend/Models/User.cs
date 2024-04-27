using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int user_id { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string user_fullName { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string user_email { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string user_phoneNumber { get; set; }

        [Required]
        public DateTime user_birthDate { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string user_address { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")]
        public string user_gender { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string user_image {  get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string user_password { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")]
        public User_status user_status { get; set; } = User_status.Unlock;

        [Required]
        public int user_quantity_canceled { get; set; }

        [Column(TypeName = "varchar(1000)")]
        public string? user_introduction { get; set; }

        [Column(TypeName = "varchar(255)")]
        public string? user_token { get; set; }

        [Column(TypeName = "varchar(255)")]
        public string? user_refreshToken { get; set; }

        public DateTime user_refreshTokenExpiryTime { get; set; }

        [Column(TypeName = "varchar(255)")]
        public string? user_resetPasswordToken { get; set; }

        public DateTime user_resetPasswordExpiry {  get; set; }

        [ForeignKey("role")]
        public int user_role_id { get; set; }
        public virtual Role? role { get; set; }

        public ICollection<Appointment>? appointments { get; set; }
        public ICollection<Schedule>? schedules { get; set; }
        public ICollection<ClickBlog>? clickBlogs { get; set; }
    }

    public enum User_status
    {
        Lock,
        Unlock
    }
}
