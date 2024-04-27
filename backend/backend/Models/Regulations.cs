using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Regulations
    {
        [Key]
        public int regulation_id {  get; set; }

        [Required]
        public int regulation_quantity_appointment { get; set; }

        public ICollection<Appointment>? appointments { get; set; }
    }
}
