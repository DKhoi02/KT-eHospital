using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("medicine")]
    [ApiController]
    public class MedicineController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public MedicineController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> getAllMedicines()
        {
            return Ok(await _context.Medicines.ToListAsync());
        }

        [HttpGet("get-all-by-status")]
        public async Task<IActionResult> getAllByStatus()
        {
            return Ok(_context.Medicines.Where(m => m.medicine_status == Medicine_status.Available && m.medicine_quantity > 0).ToList());
        }

        [HttpPost("add-new-medicine")]
        public async Task<IActionResult> addNewMedicine([FromBody] Medicine medicine)
        {
            if(medicine == null) { return BadRequest(new {Message = "Data provided is null" }); }

            var checkMedicine = await _context.Medicines.Where(m => m.medicine_name == medicine.medicine_name).FirstOrDefaultAsync();

            if(checkMedicine != null) { return BadRequest(new { Message = "The medicine name is already exist" }); }
            medicine.medicine_date = DateTime.Now;

            await _context.Medicines.AddAsync(medicine);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Add new medicine successfully",
                            medicine_id = medicine.medicine_id});

        }

        [HttpPost("update-medicine")]
        public async Task<IActionResult> updateMedicine([FromBody] Medicine medicine)
        {
            if(medicine == null) { return BadRequest(new { Message = "Data provided is null" }); }

            var checkMedicine = await _context.Medicines.Where(m => m.medicine_id == medicine.medicine_id).FirstOrDefaultAsync();

            if (checkMedicine == null) { return BadRequest(new { Message = "The medicine is not found" }); }

            if(checkMedicine.medicine_name != medicine.medicine_name)
            {
                var checkMedicineName = await _context.Medicines.Where(m => m.medicine_name == medicine.medicine_name).FirstOrDefaultAsync();

                if (checkMedicine == null) { return BadRequest(new { Message = "The medicine name is already exist" }); }
            }

            medicine.medicine_date = DateTime.Now;            

            _context.Entry(checkMedicine).CurrentValues.SetValues(medicine);
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Update medicine successfully"});
        }

        [HttpPost("upload-img-medicine")]
        public async Task<IActionResult> updateImage(int medicine_id)
        {
            var file = Request.Form.Files[0];

            if (file.Length > 0)
            {
                var fileName = Path.GetFileName(file.FileName);
                
                var filePath = Path.Combine(Path.Combine(_env.ContentRootPath, "MedicineImgs", fileName));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                else { fileName = medicine_id + fileName; }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var medicine = await _context.Medicines.FirstOrDefaultAsync(m => m.medicine_id == medicine_id);
                medicine.medicine_image = $"https://localhost:7072/MedicineImgs/{fileName}";

                _context.Entry(medicine).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Update image successful" });
            }

            return BadRequest(new { Message = "Update image unsuccessful. Please try again." });
        }

        [HttpGet("get-medicine-by-id")]
        public async Task<IActionResult> getMedicineByID(int medicine_id)
        {
            if (medicine_id == 0 || medicine_id == null) return BadRequest(new { Message = "Data provided is null" });

            var medicine = _context.Medicines.FirstOrDefault(m => m.medicine_id == medicine_id);

            if (medicine == null) { return BadRequest(new { Message = "Medicine is not found" }); }

            return Ok(medicine);
        }

    }
}
