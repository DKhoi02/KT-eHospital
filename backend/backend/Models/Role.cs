using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Role
    {
        [Key]
        public int role_id { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string role_name { get; set; }

        public ICollection<User>? Users { get; set; }
    }
}
