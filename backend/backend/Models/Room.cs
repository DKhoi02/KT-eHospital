using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Room
    {
        [Key]
        public int room_id { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string room_name { get; set;}

        [Required]
        [Column(TypeName = "varchar(255)")]
        public Room_status room_status { get; set; }

        public ICollection<Appointment>? Appointments { get; set; }
        public ICollection<Schedule>? Schedules { get; set; }
    }

    public enum Room_status
    {
        Available,
        Unavailable
    }
}
