using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Medicine
    {
        [Key]
        public int medicine_id { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string medicine_name { get; set; }

        [Required]
        public int medicine_quantity { get; set; }

        [Required]
        public double medicine_price { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string medicine_image { get; set; }

        [Required]
        public DateTime medicine_date { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string medicine_description { get; set;}

        [Required]
        [Column(TypeName = "varchar(20)")]
        public Medicine_status medicine_status { get; set; }

        public ICollection<Prescription>? prescriptions { get; set; }
    }

    public enum Medicine_status
    {
        Available,
        Unavailable
    }
}
