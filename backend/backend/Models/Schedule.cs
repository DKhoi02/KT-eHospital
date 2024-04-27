using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Schedule
    {
        [Key]
        public int schedule_id { get; set; }
        public DateTime? schedule_date { get; set; }

        [ForeignKey("doctor")]
        public int? schedule_doctor_id { get; set; }
        public virtual User? doctor { get; set; }

        [ForeignKey("room")]
        public int? schedule_room_id { get; set; }
        public virtual Room? room { get; set; }

    }
}
