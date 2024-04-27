using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Appointment
    {
        [Key]
        public int appointment_id { get; set; }

        [Required]
        public DateTime appointment_time { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public Appointment_status appointment_status { get; set; }

        public int? appointment_ordinal_number {get;set;}

        [Column(TypeName = "varchar(2000)")]
        public string? appointment_symptom { get; set; }

        [ForeignKey("user")]
        public int appointment_user_id { get; set; }
        public virtual User? user { get; set; }

        [ForeignKey("doctor")]
        public int? appointment_doctor_id { get; set; }
        public virtual User? doctor { get; set; }

        [ForeignKey("pharmacist")]
        public int? appointment_pharmacist_id { get; set; }
        public virtual User? pharmacist { get; set; }

        [ForeignKey("regulation")]
        public int appointment_regulation_id { get; set; }
        public virtual Regulations? regulation { get; set; }

        [ForeignKey("room")]
        public int? apointment_room_id { get; set; }
        public virtual Room? room { get; set; }

        public ICollection<Prescription>? prescriptions { get; set;}
    }

    public enum Appointment_status
    {
        Scheduled,
        Completed,
        Canceled,
        Diagnosed,
        Prescribed,
        Examined
    }
}
