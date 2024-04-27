using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Prescription
    {
        [Key]
        public int prescription_id { get; set; }

        [Required]
        public int prescription_quantity { get; set; }

        [Required]
        public double prescription_price { get; set; }

        [Required]
        public double prescription_total { get; set; }

        [Required]
        public int prescription_number_medicine_perday { get; set; }

        [Required]
        public int prescription_eachtime_take {  get; set; }

        [ForeignKey("appointment")]
        public int prescription_appointment_id { get; set; }
        public virtual Appointment? appointment { get; set; }

        [ForeignKey("medicine")]
        public int prescription_medicine_id { get; set; }
        public virtual Medicine? medicine { get; set; }
    }
}
