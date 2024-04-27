using Aspose.Words.Saving;
using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.RegularExpressions;
using System.Text;
using Aspose.Words;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Controllers
{
    [Route("blog")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BlogController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet("get-blog-by-id")]
        public async Task<IActionResult> getBlogByID(int id)
        {
            var blog = _context.Blogs.Where(b => b.blog_id == id).FirstOrDefault();
            return Ok(new { id = blog.blog_id, title = blog.blog_title, img = blog.blog_img, content = LoadWordFile(blog.blog_content), status = blog.blog_status, demo = blog.blog_demo });
        }

        [HttpGet("get-all-blog")]
        public async Task<IActionResult> getAllBlog()
        {
            return Ok(_context.Blogs.ToList());
        }

        [HttpGet("get-blog-home")]
        public async Task<IActionResult> getBlogHome()
        {
            return Ok(_context.Blogs.Where(b => b.blog_status == Blog_status.Public).OrderByDescending(p => p.blog_id).Take(3).ToList());
        }

        [HttpGet("get-blog-search")]
        public async Task<IActionResult> getBlogSearch()
        {
            return Ok(_context.Blogs.Where(p => p.blog_status == Blog_status.Public).OrderByDescending(p => p.blog_id).ToList());
        }

        [HttpPost("add-new-blog")]
        public async Task<IActionResult> addNewBlog()
        {
            string title = Request.Form["title"];
            string demo = Request.Form["demo"];
            string status = Request.Form["status"];
            var content = Request.Form.Files["uploadContent"];
            var img = Request.Form.Files["uploadImg"];

            if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(demo) || string.IsNullOrEmpty(status) || content == null || img == null)
                return BadRequest(new {Message = "Please enter full information before add new blog"});

            Blog blog = new Blog();
            
            var checkBlog = _context.Blogs.Where(b => b.blog_title ==  title).FirstOrDefault();
            if (checkBlog != null) { return BadRequest(new { Message = "Blog title is already exist. Please enter another title" }); }

            blog.blog_title = title;
            blog.blog_demo = demo;
            blog.blog_status = Blog_status.Public;
            if(status == "Private")
            {
                blog.blog_status = Blog_status.Private;
            }

            if (IsWordFile(content.FileName) && IsImageFile(img.FileName))
            {
                blog.blog_content = await SaveFileAsync(content, "BlogFiles", title);
                blog.blog_img = await SaveFileAsync(img, "BlogImgs", title);
            }
            else
            {
                return BadRequest(new { Message = "File Format Not Supported" });
            }

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();           

            var users = _context.Users.ToList();

            foreach(var user in users)
            {
                ClickBlog clickBlog = new ClickBlog();
                clickBlog.click_blog_blog_id = blog.blog_id;
                clickBlog.click_blog_user_id = user.user_id;
                clickBlog.click_blog_count = 0;

                _context.ClickBlogs.Add(clickBlog);
                await _context.SaveChangesAsync();
            }


            return Ok(new {Message = "Add new Blog successfully"});
        }

        [HttpPost("update-blog")]
        public async Task<IActionResult> updateBlog()
        {
            int id = Convert.ToInt32(Request.Form["id"]);
            string title = Request.Form["title"];
            string demo = Request.Form["demo"];
            string status = Request.Form["status"];
            var content = Request.Form.Files["uploadContent"];
            var img = Request.Form.Files["uploadImg"];

            if (id == 0 || id == null || string.IsNullOrEmpty(title) || string.IsNullOrEmpty(demo) || string.IsNullOrEmpty(status))
                return BadRequest(new { Message = "Please enter full information before add new blog" });

            var blog = _context.Blogs.Where(b => b.blog_id == id).FirstOrDefault();

            if(blog.blog_title != title)
            {
                var checkBlog = _context.Blogs.Where(b => b.blog_title == title).FirstOrDefault();
                if (checkBlog != null) { return BadRequest(new { Message = "Blog title is already exist. Please enter another title" }); }
            }

            blog.blog_title = title;
            blog.blog_demo = demo;
            blog.blog_status = Blog_status.Public;
            if (status == "Private")
            {
                blog.blog_status = Blog_status.Private;
            }

            if(content != null)
            {
                if (IsWordFile(content.FileName))
                {
                    blog.blog_content = await SaveFileAsync(content, "BlogFiles", title);
                }
                else
                {
                    return BadRequest(new { Message = "File Format Not Supported" });
                }
            }

            if(img != null)
            {
                if (IsImageFile(img.FileName))
                {
                    blog.blog_img = await SaveFileAsync(img, "BlogImgs", title);
                }
                else
                {
                    return BadRequest(new { Message = "File Format Not Supported" });
                }
            }

            _context.Entry(blog).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Update Blog successfully" });
        }

        private async Task<String> LoadWordFile(string fileName)
        {
            if (fileName.Length == 0) return "";
            var filePath = Path.Combine(Path.Combine(_env.ContentRootPath, "BlogFiles", fileName));

            if (System.IO.File.Exists(filePath))
            {
                Document doc = new Document(filePath);

                MemoryStream stream = new MemoryStream();

                HtmlSaveOptions options = new HtmlSaveOptions();
                options.ExportImagesAsBase64 = true;

                doc.Save(stream, options);

                stream.Position = 0;

                string htmlContent = new StreamReader(stream, Encoding.UTF8).ReadToEnd();

                htmlContent = Regex.Replace(htmlContent, @"(Evaluation Only\. Created with Aspose\.Words\. Copyright \d{4}-\d{4} Aspose Pty Ltd\.|Created with an evaluation copy of Aspose\.Words\. To discover the full versions of our APIs please visit: https://products\.aspose\.com/words/)", string.Empty);
                htmlContent = htmlContent.Replace("This document was truncated here because it was created in the Evaluation Mode.", "");
                htmlContent = htmlContent.Replace("<div style=\"-aw-headerfooter-type:header-primary; clear:both\"><p style=\"margin-top:0pt; margin-bottom:10pt\"><span style=\"height:0pt; display:block; position:absolute; z-index:-65537\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnAAAAFUCAYAAACkxgEeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBD6fLggAAIABJREFUeJzs3eeS4zi6NeoFkJT36cp2z/SOL+Kc+7+as/d8u03ZtPKk6IDzg4JSqZQh5Zm1npiMnqqSF1NcegG8EFprDSIiIiLKDXnqB0BERERE2TDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUMAxwRERFRzjDAEREREeUM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syrIqURROAuUZlurPFTdlplfFLDt8TU/tGgC41tkhvCB515zb/W5HhoDHBEREVHOcBEDERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMcERERUc4wwBERERHlDAMc0f/fbh3TAAAAMAzy73oqdjQBFQBAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAMQIHABAjMABAAAAwNMAr5KwyX/zZGUAAAAASUVORK5CYII=\" width=\"624\" height=\"340\" alt=\"\" style=\"margin-top:229.96pt; -aw-left-pos:0pt; -aw-rel-hpos:margin; -aw-rel-vpos:margin; -aw-top-pos:0pt; -aw-wrap-type:none; position:absolute\" /></span><span style=\"-aw-import:ignore\">&#xa0;</span></p></div>", "");
                htmlContent = htmlContent.Replace("<img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA5gAAAH0CAMAAABvv3KHAAAAXVBMVEUmJiX+wGK6phNFmTi/v8A1h7yZmZlmZmb0eCpFRUR9sU10ptTp6ejv4kTUwiN0dHLxzpb+6daexEXb29wzMzP6p0iysrH2jz6IiIdaWlrh0Tv230rMzMz29vX////sfy95AAAh0ElEQVR4XuzTsQAAAAACsEjyx0yjY3NYegcQE8QExAQxATFBTEBMEBMQExATxATEBDEBMUFMQExATBATEBPEBMQEMQExATFBTEBMEBMQE8QExATEBDEBMUFMQEwQExATEBPEBMQEMQExQUxATEBMEBMQE8QExAQxATEBMUFMQEwQExATxATEBMQEMQExQUxATBATEBMQE8QExAQxATFBTEBMQEwQExATxATEBDEBMQExQUxATBATEBPEBMQEUkBMQEwQExATxATEBDEBMQExQUxATBATEBPEBMQExAQxATFBTEBMEBMQExATxATEBDEBMUFMQExATBATEBPEBMQEMQExATFBTEBMEBMQE8QExATEBDEBMUFMQEwQExATEBPEBMQEMQExQUxATEBMEBMQE8QExAQxATEBMUHMYyAmICaICYg5duxYt2EYBoDoINkDpY2AJpL//5ktOtRIwiKBm4YpcG+V1wNJ+5xq1ntfn3rvGoUAwnS3votIuyBRBCBMtyXSboisGRUAwtQlLYuyT48KAGHqnla51KMEQJhz5VVqFAEI06QlxDxqAITpPc1yzagCEOZqCVkeAGG+1xJbmCVAmJpmuc8oAxDm3hKiUQYgTH27LRYgzPVu4xIgzJlflx5lAMLUlulRByDMzhoLwvwn5+UMgDDpEiDMe116JOZUtf7FTHV6AIRZ2aXrGNuNMYw6QZhFe6zb2H42zOOJAMLsD3SpR5UvaBMgTGsZu/hkbA8ZGs8AEOZsmZ5Oy/uGxe8BhCktIce7H1m+KE2AMPc7P2R1S7DQgjALDkw93rczxozTAML0ltm/3/t2kgVAmH+0yI7twNAEYZYusj2ZlwxNEGbtIit+1eW4tj1mEMAJIMwP9s5ouXFViaLtFAcFiRqkQcYoB+b/P/OexMmQBKChJavm1rAf/UBhlRa76W6QKbYWuIjJVjon//8CgHTMcGvV8J+UtdywP7//1+v7pIdXWcs5c9ofObb9PbblhmnZwTyttaBU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cPhKMmDeE77XeBJM5zHqdTCd72NWlsJp+h7MPvU2eAL0orh55Ta6uAhmPiybeYL5RhNMBC9vum+m+VCT2oeaD4KJE0F2a8Nk8whMtDL12iDY3Px+8ye2gZNfvxGH45yBUr+S1a+96SKYYlvrXHF2E8y3mmDiqyixhgVH5gif5EV8jJElPgQmqI81Hbb2H4ZgopWvtgKr749LSmfcOhNEzLD67SXrlax+7bXXwAxrKoPF009pgjnBhNrBWhGyr6tSqaCWtMYFFXoGTIxKcRuXh2BqWwuXX4PZUNktMKm7yK6moQ+1YdVf6S6ByRiMYLnWBHOCiYzRTTa8rJDU5mB4DsyfYD1t8pIGYKIVUWfUt2Bq/1K3FZTLIHBGHSzpr+TGYPb+ivJsgjnlzKJ8grVCIhzOVLGU8np54K1ZYmNwJZTRc6dS2CBxbEwPYGDxBUqreqtj8JFxtKq22nD2SRnS9xUO16b9wtU/FDelWs65H7b1qb3jVH2DBcqRdPDXmvxf+3QwAAAAwEDIZP6Yo7hfOTQxgSAmICaICYgJYgJiAmKCmICYICYgJogJiAmICWICYoKYgJggJiAmICaICYgJYgJigpiAmICYICYgJogJiAliAmICYoKYgJggJiAmiAmICYgJYgJigpiAmCAmICYgJogJiAliAmKCmICYgJggJiAmiAmICWICYgJigpiAmCAmICaICYgJiAliAmKCmICYICYgJogJiAmICWICYoKYgJggJiAmICaICYgJYgJigpiAmICYICYgJogJiAliAmICYoKYgJggJiAmiAmICYgJYgJigpiAmCAmICYgJogJiAliAmKCmICYgJggJiAmiAmICWICYgJigpiAmCAmICaICYgJiAliAmKCmICYICYgJiAmiAmICWICYoKYgJiAmCAmICaICYgJYgJiAgdo2QUAzrAGUwAAAABJRU5ErkJggg==\" width=\"920\" height=\"500\" alt=\"\" style=\"margin-top:172.5pt; margin-left:231pt; -aw-left-pos:0pt; -aw-rel-hpos:margin; -aw-rel-vpos:margin; -aw-top-pos:0pt; -aw-wrap-type:none; position:absolute\" />", "");

                return htmlContent;
            }
            return "";
        }

        private async Task<string> SaveFileAsync(IFormFile file, string directory, string title)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            var fileName = title+ Path.GetFileName(file.FileName);
            var filePath = Path.Combine(Path.Combine(_env.ContentRootPath, directory, fileName));

            while (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            if(directory == "BlogImgs")
            {
                return $"https://localhost:7072/BlogImgs/{fileName}";
            }

            return fileName;
        }

        private bool IsWordFile(string fileName)
        {
            string fileType = Path.GetExtension(fileName);
            return fileType.Equals(".doc", StringComparison.OrdinalIgnoreCase) || fileType.Equals(".docx", StringComparison.OrdinalIgnoreCase);
        }

        private bool IsImageFile(string fileName)
        {
            string fileType = Path.GetExtension(fileName);
            return fileType.Equals(".jpg", StringComparison.OrdinalIgnoreCase) ||
                   fileType.Equals(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                   fileType.Equals(".png", StringComparison.OrdinalIgnoreCase);
        }
    }
}
