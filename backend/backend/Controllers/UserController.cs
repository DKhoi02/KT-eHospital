using Aspose.Words;
using Aspose.Words.Saving;
using backend.Context;
using backend.Helpers;
using backend.Models;
using backend.Models.Dto;
using backend.UtilityService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace backend.Controllers
{
    [Route("user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly IWebHostEnvironment _env;

        public UserController(AppDbContext appDbContext, IConfiguration configuration, IEmailService emailService, IWebHostEnvironment env) 
        {
            _context = appDbContext;     
            _configuration = configuration;
            _emailService = emailService;
            _env = env;
        }

        [HttpPost("signin")]
        public async Task<IActionResult> SignIn()
        {
            string email = Request.Form["email"];
            string password = Request.Form["password"];
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password)) 
            {
                return BadRequest(new { Message = "Invalid user data" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);

            if (user == null) return  NotFound(new {Message = "User Not Found"});

            if(!PasswordHasher.VerifyPassword(password, user.user_password))
            {
                return BadRequest(new { Message = "Password is wrong" });
            }

            user.user_token = CreateJwt(user);
            var newAccessToken = user.user_token;
            var newRefreshToken = CreateRefreshToken();
            user.user_refreshToken = newRefreshToken;
            user.user_refreshTokenExpiryTime = DateTime.Now.AddDays(5);
            await _context.SaveChangesAsync();

            return Ok(new TokenApiDto()
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken
            });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] User userObj)
        {
            if (userObj == null) return BadRequest("Please enter full information before Sign Up");

            userObj.user_image = "https://localhost:7072/Images/avatar_male.jpg";

            if(userObj.user_gender == "Female")
            {
                userObj.user_image = "https://localhost:7072/Images/avatar_female.jpg";
            }

            var getRole = await _context.Roles.Where(r => r.role_id == userObj.user_role_id).FirstOrDefaultAsync();

            if (getRole == null)
            {
                userObj.user_role_id = _context.Roles.Where(r => r.role_name == "Patient").Select(r => r.role_id).FirstOrDefault();
            }
            userObj.user_status = User_status.Unlock;
            userObj.user_quantity_canceled = 0;
            userObj.user_introduction = "";
            userObj.user_token = "";
            userObj.user_refreshToken = "";
            userObj.user_refreshTokenExpiryTime = DateTime.Now;
            userObj.user_resetPasswordToken = "";
            userObj.user_resetPasswordExpiry = DateTime.Now;

            userObj.user_fullName = userObj.user_fullName.Trim(); 
            userObj.user_address = userObj.user_address.Trim();
            userObj.user_gender = userObj.user_gender.Replace(" ", "");
            
            if(!checkEmail(userObj.user_email)) return BadRequest( new { Message = "Email is incorrect format. Please enter again before Sign Up" });

            if (await _context.Users.AnyAsync(u => u.user_email.Equals(userObj.user_email))) return BadRequest(new { Message = "Email already exists. Please enter again before Sign Up" });

            if (!checkPhoneNumber(userObj.user_phoneNumber)) return BadRequest("Phone number is incorrect format. Please enter again before Sign Up");
             
            if(!checkBirthDate(userObj.user_birthDate)) return BadRequest("Birth date cannot be in the future. Please enter again before Sign Up");

            if(!checkPassword(userObj.user_password)) return BadRequest("Password is incorrect format. Please enter again before Sign Up");

            userObj.user_password = PasswordHasher.HashPassword(userObj.user_password);

            await _context.Users.AddAsync(userObj);
            await _context.SaveChangesAsync();

            var blogs = _context.Blogs.ToList();

            foreach (var blog in blogs)
            {
                ClickBlog clickBlog = new ClickBlog();
                clickBlog.click_blog_blog_id = blog.blog_id;
                clickBlog.click_blog_user_id = userObj.user_id;
                clickBlog.click_blog_count = 0;
                _context.ClickBlogs.Add(clickBlog);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Message = "Sign Up Success"
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(TokenApiDto tokenApiDto)
        {
            if (tokenApiDto is null) { return BadRequest("Invalid Client Request"); }

            string accessToken = tokenApiDto.accessToken;
            string refreshToken = tokenApiDto.refreshToken;
            var principal = GetPrincipalFromExpriredToken(accessToken);
            var email = principal.Identity.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);

            if (user is null || user.user_refreshToken != refreshToken || user.user_refreshTokenExpiryTime <= DateTime.Now)
            {
                return BadRequest("Invaid Request");
            }

            var newAccessToken = CreateJwt(user);
            var newRefreshToken = CreateRefreshToken();
            user.user_refreshToken = newAccessToken;
            await _context.SaveChangesAsync();

            return Ok(new TokenApiDto()
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
            });
        }

        [HttpPost("send-reset-email/{email}")]
        public async Task<IActionResult> SendEmail(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);

            if (user == null) return NotFound( new
            {
                StatusCode = 404,
                Message = "Email doesn't exitst"
            });

            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var emailToken = Convert.ToBase64String(tokenBytes);
            user.user_resetPasswordToken = emailToken;
            user.user_resetPasswordExpiry = DateTime.Now.AddMinutes(15);
            string from = _configuration["EmailSettings:From"];
            var emailModel = new Email(email, "Reset Password!", EmailBody.EmailStringBody());
            _emailService.SendEmail(emailModel);
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok( new
            {
                StatusCode = 200,
                Message = "Email Sent!"
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.user_email == resetPasswordDto.resetPass_email);

            if (user == null) return NotFound(new
            {
                StatusCode = 404,
                Message = "Email doesn't exitst"
            });

            var tokenCode = user.user_resetPasswordToken;
            DateTime emailTokenExpiry = user.user_resetPasswordExpiry;

            if(tokenCode != resetPasswordDto.resetPass_emailToken || emailTokenExpiry < DateTime.Now)
            {
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Invalid reset link"
                });
            }

            user.user_password = PasswordHasher.HashPassword(resetPasswordDto.resetPass_newPassword);
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                StatusCode = 200,
                Message = "Password Reset Successfully"
            });
        }

            [HttpGet("get-image")]
            public async Task<IActionResult> getImage(string email)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);
                var filePath = Path.Combine(_env.ContentRootPath, "Images", user.user_image);

                byte[] imageData = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(imageData, "image/jpeg");
            }

        [HttpGet("get-current-user")]
        public async Task<IActionResult> getCurrentUset(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);
            return Ok(user);
        }

        [HttpPost("update-profile")]
        public async Task<IActionResult> updateProfile([FromBody] User userObj)
        {
            if (userObj == null) { return BadRequest(new { Message = "Please enter full information before update profile" }); }

            userObj.user_fullName = userObj.user_fullName.Trim();
            if(userObj.user_fullName.Length == 0)
            {
                return BadRequest(new { Message = "Please enter full name before update profile" });
            }
            userObj.user_address = userObj.user_address.Trim();

            if (userObj.user_address.Length == 0)
            {
                return BadRequest(new { Message = "Please enter full name before update profile" });
            }

            userObj.user_gender = userObj.user_gender.Replace(" ", "");

            if (!checkEmail(userObj.user_email)) return BadRequest(new { Message = "Email is incorrect format. Please enter again before update profile" });

            var checkUser = await _context.Users.FirstOrDefaultAsync(u => u.user_id == userObj.user_id);

            if(checkUser.user_email != userObj.user_email)
            {
                if (_context.Users.Any(u => u.user_email.Equals(userObj.user_email))) return BadRequest(new { Message = "Email already exists. Please enter again before update profile" });
            }

            if (!checkPhoneNumber(userObj.user_phoneNumber)) return BadRequest("Phone number is incorrect format. Please enter again before update profile");

            if (!checkBirthDate(userObj.user_birthDate)) return BadRequest("Birth date cannot be in the future. Please enter again before update profile");

            _context.Entry(checkUser).CurrentValues.SetValues(userObj);
            await _context.SaveChangesAsync();

            userObj.user_token = CreateJwt(userObj);
            var newAccessToken = userObj.user_token;
            var newRefreshToken = CreateRefreshToken();
            userObj.user_refreshToken = newRefreshToken;
            userObj.user_refreshTokenExpiryTime = DateTime.Now.AddDays(5);

            _context.Entry(checkUser).CurrentValues.SetValues(userObj);
            await _context.SaveChangesAsync();

            return Ok(new TokenApiDto()
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
            });
        }

        [HttpPost("update-image")]
        public async Task<IActionResult> updateImage(string email)
        {
            var file = Request.Form.Files[0];

            if (file.Length>0) 
            {
                var fileName = Path.GetFileName(file.FileName);
                fileName = email + fileName;
                var filePath = Path.Combine(Path.Combine(_env.ContentRootPath, "Images", fileName));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);    
                }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);
                user.user_image = $"https://localhost:7072/Images/{fileName}"  ;
                
                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "ok" });
            }

            return BadRequest(new { Message = "Update image unsuccessful. Please try again." });
        }

        [HttpGet("get-all-doctor")]
        public async Task<IActionResult> getAllDoctor()
        {
            return Ok(await _context.Users.Where(u => u.role.role_name == "Doctor" && u.user_status == User_status.Unlock).ToListAsync());
        }

        [HttpGet("get-doctor-home")]
        public async Task<IActionResult> getDoctorHome()
        {
            var getDoctorID = await _context.Users.Where(u => u.role.role_name == "Doctor" && u.user_status == User_status.Unlock).ToListAsync();

            List<User> shuffledList = Shuffle(getDoctorID);

            List<Object> list = new List<Object>();

            for(int i = 0; i < 4; i++)
            {
                list.Add(shuffledList[i]);
            }

            return Ok(list);
        }

        [HttpPost("upload-file-profile")]
        public async Task<IActionResult> uploadFileProfile(string email)
        {
            var file = Request.Form.Files[0];

            if (file.Length > 0)
            {
                var fileName = Path.GetFileName(file.FileName);
                fileName = email + fileName;

                string fileType = Path.GetExtension(fileName);
                if(!(fileType.Equals(".doc", StringComparison.OrdinalIgnoreCase) || fileType.Equals(".docx", StringComparison.OrdinalIgnoreCase)))
                {
                    return BadRequest(new { Message = "Upload file unsuccessful. Please choose file type is word file" });
                }

                var filePath = Path.Combine(Path.Combine(_env.ContentRootPath, "ProfileFiles", fileName));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.user_email == email);
                user.user_introduction = fileName;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "ok" });
            }

            return BadRequest(new { Message = "Update profile file unsuccessful. Please try again." });
        }

        [HttpGet("get-doctor-detail")]
        public async Task<IActionResult> getDoctorDetail(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest(new { Message ="Data provided is null"});

            var doctor = _context.Users.Where(u => u.user_email == email).FirstOrDefault();
            if (doctor == null) return BadRequest(new { Message = "Doctor is not found" });

            return Ok(new 
            { 
                img = doctor.user_image,
                profile = LoadWordFile(doctor.user_introduction)  
            });
        }

        [HttpGet("contact")]
        public async Task<IActionResult> contact(string name, string email, string subject, string message)
        {
            string from = _configuration["EmailSettings:From"];
            var emailModel = new Email("khoidndgcc200058@fpt.edu.vn", subject, EmailBody.EmailContact(name, message, email));
            _emailService.SendEmail(emailModel);

            return Ok();
        }

        //load file word to html
        private async Task<String> LoadWordFile(string fileName)
        {
            if(fileName.Length == 0) return "";
            var filePath = Path.Combine(Path.Combine(_env.ContentRootPath, "ProfileFiles", fileName));

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


                return htmlContent;
            }
            return "";
        }

        [HttpGet("get-all-employee")]
        public async Task<IActionResult> getAllEmployee()
        {
            return Ok(_context.Users.Where(u => u.user_status == User_status.Unlock && u.role.role_name == "Doctor").Select(u => new {
                user_email = u.user_email,
                user_image = u.user_image,
                user_fullName = u.user_fullName
            }).ToList());
        }

        private List<T> Shuffle<T>(List<T> list)
        {
            Random rng = new Random();
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                T value = list[k];
                list[k] = list[n];
                list[n] = value;
            }
            return list;
        }

            private bool checkEmail(string email)
        {
            email = email.Replace(" ", "");
            if (!(Regex.IsMatch(email, "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"))){
                return false;
            }

            return true;
        }

        private bool checkPhoneNumber(string phoneNumber)
        {
            phoneNumber = phoneNumber.Replace(" ", "");
            if (!(Regex.IsMatch(phoneNumber, "^(03|05|07|08|09)[0-9]{8}$")))
            {
                return false;
            }

            return true;
        }

        private bool checkBirthDate(DateTime birthDate)
        {
            DateTime currenDate = DateTime.Now;

            if (birthDate > currenDate)
            {
                return false;
            }

            return true;
        }

        private bool checkPassword(string password)
        {
            password = password.Replace(" ", "");

            if (!(Regex.IsMatch(password, "^(?=.*d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{8,}$")))
            {
                return false;
            }

            return true;
        }

        private string CreateJwt(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("KT-eHospitalKT-eHospital");

            var getUserAndRole = _context.Roles
                .Join(_context.Users.Where(u => u.user_email == user.user_email),
                role => role.role_id,
                user => user.user_role_id,
                (role, user) => new
                {
                    email = user.user_email,
                    role_name = role.role_name                  
                }).ToList();

           

            string email = "";
            string roleName = "";

            foreach(var item in getUserAndRole)
            {
                email = item.email;
                roleName = item.role_name;
            }

            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, roleName),
                new Claim(ClaimTypes.Email, email)
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials
            };

            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);
        }

        private string CreateRefreshToken()
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(64);
            var refreshToken = Convert.ToBase64String(tokenBytes);

            var tokenInUser = _context.Users.Any(a=>a.user_refreshToken == refreshToken);

            if (tokenInUser)
            {
                return CreateRefreshToken();
            }

            return refreshToken;
        }

        private ClaimsPrincipal GetPrincipalFromExpriredToken(string token)
        {
            var key = Encoding.ASCII.GetBytes("KT-eHospitalKT-eHospital");
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase)) {
                throw new SecurityTokenException("This is Invalid Token");
            }

            return principal;
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<User>> GetAllUser()
        {
                var users = await _context.Users
                                    .Select(u => new {
                                        user_id = u.user_id,
                                        user_fullName = u.user_fullName,
                                        user_email = u.user_email,
                                        user_birthDate = u.user_birthDate,
                                        user_image = u.user_image,
                                        user_status = u.user_status.ToString(),
                                        role_name = u.role.role_name
                                    }).ToListAsync();
                return Ok(users);
        }

        [HttpPost("update-status-user")]
        public async Task<IActionResult> updateStatusUser(string email, string status)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(email)) 
            {
                return BadRequest(new { Message = "Data provided is null" });
            }

            var user = _context.Users.Where(u => u.user_email == email).FirstOrDefault();

            if (user == null)
            {
                return BadRequest(new { Message = "User not found" });
            }

            user.user_status = User_status.Unlock;

            if (status.Equals("Lock"))
            {
                user.user_status = User_status.Lock;
            }

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Update Status successfully"});
        }
    }
}
