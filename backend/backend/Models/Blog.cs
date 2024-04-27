using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Blog
    {
        [Key]
        public int blog_id { get; set; }

        [Required]
        [Column(TypeName= "varchar(255)")]
        public string blog_title { get; set;}

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string blog_demo { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string blog_img { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string blog_content { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")]
        public Blog_status blog_status { get; set; }

        public ICollection<ClickBlog>? clickBlogs { get; set; }
    }

    public enum Blog_status
    {
        Public, Private
    }
}
