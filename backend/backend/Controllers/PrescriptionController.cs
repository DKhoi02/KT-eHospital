using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace backend.Controllers
{
    [Route("prescription")]
    [ApiController]
    public class PrescriptionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PrescriptionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add-prescription")]
        public async Task<IActionResult> addPrescription(string email, int appointment_id,string medicine_name, 
                                                            int medicine_total,int number_perday, int pill)
        {
            if (appointment_id == 0 || appointment_id == null 
                || medicine_total == 0 || medicine_total == null 
                || number_perday == 0 || number_perday == null 
                || pill == 0 || pill == null 
                || string.IsNullOrEmpty(medicine_name) 
                || string.IsNullOrEmpty(email)) { return BadRequest(new {Message = "Data provided is null"}); }

            var doctor = _context.Users.Where(u => u.user_email == email).FirstOrDefault();
            if (doctor == null) { return BadRequest(new { Message = "The doctor is not found" }); }

            if(medicine_total < number_perday)
            {
                return BadRequest(new { Message = "Total Medicine Quantity can't least than Number of take medicine per day" });
            }

            if (medicine_total < pill)
            {
                return BadRequest(new { Message = "Total Medicine Quantity can't least than Each time, take pill" });
            }

            if (number_perday < pill)
            {
                return BadRequest(new { Message = "Number of take medicine per day can't least than Each time, take pill" });
            }

            var appointment = _context.Appointments.Where(a => a.appointment_id == appointment_id).FirstOrDefault();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            var medicine = _context.Medicines.Where(m => m.medicine_name == medicine_name).FirstOrDefault();
            if(medicine == null) { return BadRequest(new { Message = "Medicine is not found" }); }

            if(medicine.medicine_quantity < medicine_total)
            {
                return BadRequest(new { Message = "The quantity remaining in stock is insufficient"});
            }

            var checkPrescription = _context.Prescriptions.Where(p => p.prescription_appointment_id == appointment_id
                                                                        && p.medicine.medicine_name == medicine_name).FirstOrDefault();

            if (checkPrescription != null) { return BadRequest(new { Message = "Medicine is already exist"});}

            appointment.appointment_doctor_id = doctor.user_id;
            appointment.appointment_status = Appointment_status.Prescribed;
            _context.Entry(appointment).State = EntityState.Modified;

            Prescription prescription = new Prescription();
            prescription.prescription_quantity = medicine_total;
            prescription.prescription_price = medicine.medicine_price;
            prescription.prescription_total = medicine_total* medicine.medicine_price;
            prescription.prescription_number_medicine_perday = number_perday;
            prescription.prescription_eachtime_take = pill;
            prescription.prescription_appointment_id = appointment_id;
            prescription.prescription_medicine_id = medicine.medicine_id;

            await _context.Prescriptions.AddAsync(prescription);
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Add successfully"});
        }

        [HttpGet("get-prescription-by-id")]
        public async Task<IActionResult> getPrescriptionByID(int id)
        {
            if(id == 0 || id == null)
            {
                return BadRequest(new {Message = "Data provided is null"});
            }

            var data = _context.Prescriptions.Where(p => p.prescription_appointment_id == id)
                                                .Select(p => new
                                                {
                                                    id = p.prescription_id,
                                                    name = p.medicine.medicine_name,
                                                    quantity = p.prescription_quantity,
                                                    perday = p.prescription_number_medicine_perday,
                                                    eachtime = p.prescription_eachtime_take,
                                                    total = p.prescription_total
                                                }).ToList();
            return Ok(data);
        }

        [HttpDelete("delete-prescripton")]
        public async Task<IActionResult> deletePrescription(int id)
        {   
            if(id  == 0 || id == null) { return BadRequest(new { Message = "Data provided is null" });  }

            var prescription = _context.Prescriptions.Where(p => p.prescription_id == id).FirstOrDefault();

            if(prescription == null) { return BadRequest(new { Message = "Prescription is not found" }); }

            var medicine = _context.Medicines.Where(m => m.medicine_id == prescription.prescription_medicine_id).FirstOrDefault();
            if(medicine == null) { return BadRequest(new { Message = "Medicine is not found" }); }

            medicine.medicine_quantity = medicine.medicine_quantity + prescription.prescription_quantity;
            _context.Entry(medicine).State = EntityState.Modified;

            var checkPrescription = _context.Prescriptions.Where(p => p.prescription_appointment_id == prescription.prescription_appointment_id).Count();

            if(checkPrescription == 1) 
            {
                var getAppointment = _context.Appointments.Where(a => a.appointment_id == prescription.prescription_appointment_id).FirstOrDefault();
                getAppointment.appointment_status = Appointment_status.Diagnosed;
                if(getAppointment.appointment_symptom == null)
                {
                    getAppointment.appointment_status = Appointment_status.Scheduled;
                }
                _context.Entry(getAppointment).State = EntityState.Modified;
            }                   

            _context.Prescriptions.Remove(prescription);
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Delete prescription successfully"});
        }
    }
}
