using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ClickBlog
    {
        [Key]
        public int click_blog_id { get; set; }

        [Required]
        public int click_blog_count { get; set; }

        [ForeignKey("user")]
        public int click_blog_user_id { get; set; }
        public virtual User? user { get; set; }

        [ForeignKey("blog")]
        public int click_blog_blog_id { get; set; }
        public virtual Blog? blog { get; set; }
    }
}
