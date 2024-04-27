using backend.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("regulation")]
    [ApiController]
    public class RegulationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegulationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> getRegulations()
        {
            return Ok(await _context.Regulations.FirstOrDefaultAsync());
        }

        [HttpPost("update-regulation")]
        public async Task<IActionResult> updateRegulation(int quantityAppointment)
        {
            if (quantityAppointment == null) { return BadRequest(new {Message = "Data Provided is null"}); } 

            var regulartion = await _context.Regulations.FirstOrDefaultAsync();

            if (regulartion == null) { return BadRequest(new { Message = "Regulation is not found" }); }

            if(quantityAppointment < 0) { return BadRequest(new { Message = "Please enter Quantity Of Appointment more than zero" }); }

            regulartion.regulation_quantity_appointment = quantityAppointment;

            _context.Entry(regulartion).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Update Quantity of Appointment successfully"});
        }
    }
}
