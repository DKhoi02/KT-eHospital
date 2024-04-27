using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace backend.Controllers
{
    [Route("clickblog")]
    [ApiController]
    public class ClickBlogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClickBlogController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add-count-blog")]
        public async Task<IActionResult> addCountBlog(string email, int id)
        {
            if (string.IsNullOrEmpty(email) || id == 0 || id == null)
                return BadRequest(new { Message = "Data provided is null" });

            var user = _context.Users.Where(u => u.user_email == email).FirstOrDefault();
            if (user == null) return BadRequest(new { Message = "User is not found" });

            var blog = _context.Blogs.Where(b => b.blog_id == id).FirstOrDefault();
            if (blog == null) return BadRequest(new { Message = "Blog is not found" });

            var clickBlog = _context.ClickBlogs.Where(c => c.click_blog_blog_id == blog.blog_id && c.click_blog_user_id == user.user_id).FirstOrDefault();

            clickBlog.click_blog_count += 1;

            _context.Entry(clickBlog).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Add count blog successfully" });

        }

        [HttpGet("recomment-blog")]
        public async Task<IActionResult> recommentBlog(int articleId)
        {
            var userReads = new Dictionary<int, List<int>>();

            var users = _context.Users.ToList();
            foreach(var user in users)
            {
                var lstClick = _context.ClickBlogs.Where(c => c.click_blog_user_id == user.user_id && c.click_blog_count > 0).Select(b => b.click_blog_blog_id).ToList();
                if(lstClick.Count > 0)
                {
                    userReads.Add(user.user_id, lstClick);
                }
            }

            var numRecommendations = 3;
            var recommendations = GetRecommendations(articleId, numRecommendations, userReads);

            List<object> result = new List<object>();

            foreach(var r in recommendations)
            {
                var blog = _context.Blogs.Where(b => b.blog_id == r).Select(b => new
                {
                    id = b.blog_id,
                    title = b.blog_title,
                    img = b.blog_img
                }).FirstOrDefault();

                result.Add(blog);
            }

            return Ok(result);
        }

        private List<int> GetRecommendations(int articleId, int numRecommendations, Dictionary<int, List<int>> userReads)
        {
            var readCounts = new Dictionary<int, int>();
            foreach (var userRead in userReads)
            {
                if (userRead.Value.Contains(articleId))
                {
                    foreach (var article in userRead.Value)
                    {
                        if (article != articleId)
                        {
                            if (!readCounts.ContainsKey(article))
                            {
                                readCounts[article] = 1;
                            }
                            else
                            {
                                readCounts[article]++;
                            }
                        }
                    }
                }
            }

            var sortedArticles = readCounts.OrderByDescending(x => x.Value).Select(x => x.Key).ToList();
            var recommendations = sortedArticles.Take(numRecommendations).ToList();

            return recommendations;
        }

    }
}



