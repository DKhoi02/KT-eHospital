using backend.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("role")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoleController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> getAllRole()
        {
            return Ok(await _context.Roles.ToListAsync());
        }

        [HttpGet("get-role")]
        public async Task<IActionResult> getRole(int role_id)
        {
            if(role_id == null) { return BadRequest(new { Message = "Data is provided is null" }); }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.role_id == role_id);

            if(role == null) { return BadRequest(new { Message = "Role is not found" }); }

            return Ok(role);
        }

        [HttpGet("get-role-name")]
        public async Task<IActionResult> getRoleName(int role_id)
        {
            if (role_id == null) { return BadRequest(new { Message = "Data is provided is null" }); }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.role_id == role_id);

            if (role == null) { return BadRequest(new { Message = "Role is not found" }); }
            return Ok(role.role_name );
        }
    }
}
