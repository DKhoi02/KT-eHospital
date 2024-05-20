using backend.Context;
using backend.Helpers;
using backend.Models;
using backend.UtilityService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace backend.Controllers
{
    [Route("appointment")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AppointmentController(AppDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("book-appointment")]
        public async Task<IActionResult> bookAppointment()
        {
            DateTime appointment_time = DateTime.Parse(Request.Form["appointment_time"]);
            int user_id = int.Parse(Request.Form["user_id"]);

            var checkUser = await _context.Users.FirstOrDefaultAsync(u => u.user_id == user_id);

            if (checkUser.user_status == User_status.Lock) 
            { 
                return BadRequest( new {Message = "The reason you cannot book appointments anymore is that you have canceled too many appointments previously." }); 
            }

            string formattedDate = appointment_time.ToString("yyyy-MM-dd");

            if (appointment_time == null || user_id == null)
            {
                return BadRequest(new { Message = "Data is provided is null" });
            }

            var checkAppointment = await _context.Appointments.AnyAsync(a => a.appointment_time == appointment_time
            && a.appointment_user_id == user_id);

            if (checkAppointment) { return BadRequest(new { Message = $"You have already booked an appointment for {formattedDate}" }); }

            if (appointment_time <= DateTime.Now) { return BadRequest(new { Message = "Please book the appointment at least one day in advance" }); }

            var numberBooked = await _context.Appointments.CountAsync(a => a.appointment_time == appointment_time);

            var numberRegulation = await _context.Regulations.Where(r => r.regulation_id == 1)
                .Select(r => r.regulation_quantity_appointment).FirstOrDefaultAsync();

            if(numberBooked - numberRegulation == 0) { return BadRequest(new { Message = $"The remaining appointments available for {formattedDate} have been exhausted. Please choose another day." }); }

            Appointment appointment = new Appointment();
            appointment.appointment_time = appointment_time;
            appointment.appointment_regulation_id = 1;
            appointment.appointment_status = Appointment_status.Scheduled;
            appointment.appointment_user_id = user_id;

            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();

            string from = _configuration["EmailSettings:From"];
            var emailModel = new Email(checkUser.user_email, "Book Appointment Successfully", EmailBody.EmailBookSuccess(appointment.appointment_time.Date.ToString()));
            _emailService.SendEmail(emailModel);

            return Ok(appointment.appointment_id);
        }

        [HttpGet("get-quantity-booked")]
        public async Task<IActionResult> getQuantityBooked(string appointment_time)
        {
            DateTime time = DateTime.Parse(appointment_time);

            var numberBooked = await _context.Appointments.CountAsync(a => a.appointment_time == time && a.appointment_status != Appointment_status.Canceled);

            var numberRegulation = await _context.Regulations.Where(r => r.regulation_id == 1)
                .Select(r => r.regulation_quantity_appointment).FirstOrDefaultAsync();

            return Ok(numberRegulation - numberBooked);
        }

        [HttpGet("get-all-medical-by-doctor")]
        public async Task<IActionResult> getAllMedicalByDoctor(string email)
        {
            if(string.IsNullOrEmpty(email)) { return BadRequest(new { Message = "Data provided is null" }); }

            var user = _context.Users.Where(u => u.user_email == email).FirstOrDefault();

            var getSchedule = _context.Schedules.Where(s => s.schedule_doctor_id == user.user_id 
                                                        && s.schedule_date == DateTime.Now.Date).FirstOrDefault();

            if(getSchedule == null) { return Ok(null); }

            var data = await _context.Appointments.Where(a => a.apointment_room_id == getSchedule.schedule_room_id
                                                   && a.appointment_time == getSchedule.schedule_date 
                                                   && (a.appointment_status == Appointment_status.Scheduled || 
                                                        a.appointment_status == Appointment_status.Diagnosed || 
                                                        a.appointment_status == Appointment_status.Prescribed))
                                             .Select(a => new
                                             {
                                                 id = a.appointment_id,
                                                 no = a.appointment_ordinal_number,
                                                 user_image = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_image).FirstOrDefault(),
                                                 user_fullName = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_fullName).FirstOrDefault(),
                                                 user_email = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_email).FirstOrDefault(),
                                                 user_gender = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_gender).FirstOrDefault(),
                                                 user_birthDate = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_birthDate).FirstOrDefault(),
                                                 user_phoneNumber = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_phoneNumber).FirstOrDefault(),
                                                 checkAppointment = a.appointment_status,
                                             }).ToListAsync();
            return Ok(data);
        }

        [HttpGet("get-all-medical-by-pharmacist")]
        public async Task<IActionResult> getAllMedicalByPharmacist()
        {
            var getSchedule = _context.Schedules.Where(s => s.schedule_date == DateTime.Now.Date).FirstOrDefault();

            if (getSchedule == null) { return Ok(null); }

            var data = await _context.Appointments.Where(a => a.apointment_room_id == getSchedule.schedule_room_id
                                                   && a.appointment_time == getSchedule.schedule_date
                                                   && a.appointment_status == Appointment_status.Examined)
                                             .Select(a => new
                                             {
                                                 id = a.appointment_id,
                                                 no = a.appointment_ordinal_number,
                                                 user_image = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_image).FirstOrDefault(),
                                                 user_fullName = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_fullName).FirstOrDefault(),
                                                 user_email = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_email).FirstOrDefault(),
                                                 user_gender = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_gender).FirstOrDefault(),
                                                 user_birthDate = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_birthDate).FirstOrDefault(),
                                                 user_phoneNumber = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_phoneNumber).FirstOrDefault()
                                             }).ToListAsync();
            return Ok(data);
        }

        [HttpGet("get-user-by-appointment")]
        public async Task<IActionResult> getUserByAppointment(int appointment_id)
        {
            if (appointment_id == 0 || appointment_id == null) { return BadRequest(new {Message="Data provided is null"}); }

            var appointment = _context.Appointments.Where(a => a.appointment_id == appointment_id).FirstOrDefault();

            var user = await _context.Users.Where(u => u.user_id == _context.Appointments
                                                                    .Where(a => a.appointment_id == appointment_id)
                                                                    .Select(a => a.appointment_user_id).FirstOrDefault())
                                                                    .Select(u => new
                                                                    {
                                                                        user_fullName = u.user_fullName,
                                                                        user_email = u.user_email,
                                                                        user_phoneNumber = u.user_phoneNumber,
                                                                        user_birthDate = u.user_birthDate,
                                                                        user_address = u.user_address,
                                                                        user_gender = u.user_gender,
                                                                        symptom = _context.Appointments.Where(a => a.appointment_id == appointment_id).Select(a => a.appointment_symptom).FirstOrDefault(),
                                                                        appointment_date = appointment.appointment_time,
                                                                        doctor_email = _context.Users.Where(u => u.user_id == appointment.appointment_doctor_id).Select(u => u.user_email).FirstOrDefault(),
                                                                        doctor_name = _context.Users.Where(u => u.user_id == appointment.appointment_doctor_id).Select(u => u.user_fullName).FirstOrDefault(),
                                                                        pharmacist_email = _context.Users.Where(u => u.user_id == appointment.appointment_pharmacist_id).Select(u => u.user_email).FirstOrDefault(),
                                                                        pharmacist_name = _context.Users.Where(u => u.user_id == appointment.appointment_pharmacist_id).Select(u => u.user_fullName).FirstOrDefault(),
                                                                        no = appointment.appointment_ordinal_number,
                                                                        status = appointment.appointment_status,
                                                                        room_name = _context.Rooms.Where(r => r.room_id == appointment.apointment_room_id).Select(r => r.room_name).FirstOrDefault(),
                                                                        total_appointment = _context.Prescriptions.Where(p => p.prescription_appointment_id == appointment_id).Sum(p => p.prescription_total)

                                                                    })
                                                                    .FirstOrDefaultAsync();
            if (user == null) { BadRequest(new { Message = "Patient is not found" }); }

            return Ok(user);
        }

        [HttpPost("add-symptom")]
        public async Task<IActionResult> addSymptom(int id, string symptom, string email)
        {
            if(id == 0 || id == null || string.IsNullOrEmpty(symptom) || string.IsNullOrEmpty(email)) { return BadRequest(new { Message = "Data provided is null"}); }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if(appointment == null) { return BadRequest(new {Message = "Appointment is not found"}); }

            appointment.appointment_symptom = symptom;
            appointment.appointment_status = Appointment_status.Diagnosed;

            var doctor = _context.Users.Where(u => u.user_email == email).Select(u => u.user_id).FirstOrDefault();
            if (appointment == null) { return BadRequest(new { Message = "Doctor is not found" }); }

            appointment.appointment_doctor_id = doctor;

            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Add Symptom is successfully"});
        }

        [HttpPost("confirm-appointment")]
        public async Task<IActionResult> confirmAppointment(int id)
        {
            if (id == 0 || id == null) { return BadRequest(new { Message = "Data provided is null" }); }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            if(appointment.appointment_symptom == null || 
                _context.Prescriptions.Where(p => p.prescription_appointment_id == appointment.appointment_id).FirstOrDefault() == null)
            {
                return BadRequest(new { Message = "Please enter fully Symptom and Prescription before Confirm"});
            }

            appointment.appointment_status = Appointment_status.Examined;
            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Confirm appointment successfully" });
        }

        [HttpGet("get-history-appointment-by-doctor")]
        public async Task<IActionResult> getHistoryAppointmentByDoctor(int id)
        {
            if (id == 0 || id == null) { return BadRequest(new { Message = "Data provided is null" }); }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            var data = await _context.Appointments.Where(a => a.appointment_user_id == appointment.appointment_user_id
                                                                && a.appointment_status == Appointment_status.Completed)
                                                  .Select(a => new
                                                  {
                                                      id = a.appointment_id,
                                                      date = a.appointment_time,
                                                      content = a.appointment_symptom
                                                  }).ToListAsync();
            return Ok(data);
        }

        [HttpPost("confirm-appointment-by-pharmacist")]
        public async Task<IActionResult> confirmAppointmentByPharmacist(int id, string email)
        {
            if (id == 0 || id == null || string.IsNullOrEmpty(email)) { return BadRequest(new { Message = "Data provided is null" }); }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            var user = await _context.Users.Where(u => u.user_email == email).FirstOrDefaultAsync();
            if (user == null) { return BadRequest(new { Message = "Pharmacist is not found" }); }

            appointment.appointment_status = Appointment_status.Completed;
            appointment.appointment_pharmacist_id = user.user_id;

            var lstPrescription = _context.Prescriptions.Where(p => p.prescription_appointment_id == appointment.appointment_id).ToList();

            foreach(var p in lstPrescription)
            {
                var medicine = _context.Medicines.Where(m => m.medicine_id == p.prescription_medicine_id).FirstOrDefault();
                medicine.medicine_quantity = medicine.medicine_quantity - p.prescription_quantity;
                _context.Entry(medicine).State = EntityState.Modified;
            }

            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            var checkUser = _context.Users.Where(u => u.user_id == appointment.appointment_user_id).FirstOrDefault();

            string from = _configuration["EmailSettings:From"];
            var emailModel = new Email(checkUser.user_email, "Complete Appointment Successfully", EmailBody.EmailBookComplete(appointment.appointment_time.Date.ToString()));
            _emailService.SendEmail(emailModel);

            return Ok(new { Message = "Completed appointment successfully" });
        }

        [HttpGet("get-all-appointment-by-manager")]
        public async Task<IActionResult> getAllAppointmentManager()
        {
            try
            {
                var data = await (from a in _context.Appointments
                                  join p in _context.Users on a.appointment_user_id equals p.user_id into pGroup
                                  from patient in pGroup.DefaultIfEmpty()
                                  join d in _context.Users on a.appointment_doctor_id equals d.user_id into dGroup
                                  from doctor in dGroup.DefaultIfEmpty()
                                  join ph in _context.Users on a.appointment_pharmacist_id equals ph.user_id into phGroup
                                  from pharmacist in phGroup.DefaultIfEmpty()
                                  select new
                                  {
                                      appointment_id = a.appointment_id,
                                      patient_img = patient.user_image,
                                      patient_email = patient.user_email,
                                      patient_name = patient.user_fullName,
                                      doctor_img = doctor.user_image,
                                      doctor_email = doctor.user_email,
                                      doctor_name = doctor.user_fullName,
                                      pharmacist_img = pharmacist.user_image,
                                      pharmacist_email = pharmacist.user_email,
                                      pharmacist_name = pharmacist.user_fullName,
                                      appointment_date = a.appointment_time,
                                      appointment_status = a.appointment_status
                                  }).ToListAsync();

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("get-all-appointment-by-patient")]
        public async Task<IActionResult> getAllAppointmentPatient(string email)
        {
            if(string.IsNullOrEmpty(email))
            {
                return BadRequest(new {Message = "Data provided is null"});
            }

            var user = _context.Users.Where(u => u.user_email ==  email).FirstOrDefault();  
            if(user == null) { return BadRequest(new { Message = "User is not found" }); }

            var data = _context.Appointments.Where(a => a.appointment_user_id == user.user_id)
                                            .Select(a => new
            {
                appointment_id = a.appointment_id,
                patient_img = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_image).FirstOrDefault(),
                patient_email = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_email).FirstOrDefault(),
                patient_name = _context.Users.Where(u => u.user_id == a.appointment_user_id).Select(u => u.user_fullName).FirstOrDefault(),
                doctor_img = _context.Users.Where(u => u.user_id == a.appointment_doctor_id).Select(u => u.user_image).FirstOrDefault(),
                doctor_email = _context.Users.Where(u => u.user_id == a.appointment_doctor_id).Select(u => u.user_email).FirstOrDefault(),
                doctor_name = _context.Users.Where(u => u.user_id == a.appointment_doctor_id).Select(u => u.user_fullName).FirstOrDefault(),
                pharmacist_img = _context.Users.Where(u => u.user_id == a.appointment_pharmacist_id).Select(u => u.user_image).FirstOrDefault(),
                pharmacist_email = _context.Users.Where(u => u.user_id == a.appointment_pharmacist_id).Select(u => u.user_email).FirstOrDefault(),
                pharmacist_name = _context.Users.Where(u => u.user_id == a.appointment_pharmacist_id).Select(u => u.user_fullName).FirstOrDefault(),
                appointment_date = a.appointment_time,
                appointment_status = a.appointment_status
            }).ToList();
            return Ok(data);
        }

        [HttpPost("reset-status-appointment")]
        public async Task<IActionResult> resetStatusAppointment(int id)
        {
            if (id == 0 || id == null) { return BadRequest(new { Message = "Data provided is null" }); }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            if(appointment.appointment_time.Date < DateTime.Now.Date)
            {
                return BadRequest(new { Message = "Can't reset appointment status because this appointment in the past" });
            }

            if(!(appointment.appointment_status == Appointment_status.Diagnosed) || !(appointment.appointment_status == Appointment_status.Prescribed) || !(appointment.appointment_status == Appointment_status.Examined) || !(appointment.appointment_status == Appointment_status.Scheduled))
            {
                return BadRequest(new { Message = "Can't reset appointmen" });
            }

            appointment.appointment_status = Appointment_status.Scheduled;
            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Reset appointment successfully" });
        }

        [HttpPost("cancel-status-appointment")]
        public async Task<IActionResult> cancelStatusAppointment(int id)
        {
            if (id == 0 || id == null) { return BadRequest(new { Message = "Data provided is null" }); }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            if (appointment.appointment_time.Date < DateTime.Now.Date)
            {
                return BadRequest(new { Message = "Can't cancel appointmen because this appointment in the past" });
            }

            if(!(appointment.appointment_status == Appointment_status.Scheduled))
            {
                return BadRequest(new { Message = "Can't cancel appointment" });
            }

            appointment.appointment_status = Appointment_status.Canceled;
            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            var user = _context.Users.Where(u => u.user_id == appointment.appointment_user_id).FirstOrDefault();

            string from = _configuration["EmailSettings:From"];
            var emailModel = new Email(user.user_email, "Cancel Appointment Successfully", EmailBody.EmailBookCancel(appointment.appointment_time.Date.ToString()));
            _emailService.SendEmail(emailModel);

            return Ok(new { Message = "Cancel appointment successfully" });
        }

        [HttpPost("change-doctor")]
        public async Task<IActionResult> changeDoctor(int id, string email, string room_name, string time)
        {
            if(id == 0 || id == null || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(room_name) || string.IsNullOrEmpty(time))
            {
                return BadRequest(new { Message = "Data provided is null" });
            }

            var appointment = await _context.Appointments.Where(a => a.appointment_id == id).FirstOrDefaultAsync();
            if (appointment == null) { return BadRequest(new { Message = "Appointment is not found" }); }

            var user = await _context.Users.Where(u => u.user_email == email).FirstOrDefaultAsync();
            if (user == null) { return BadRequest(new { Message = "Doctor is not found" }); }

            var room = await _context.Rooms.Where(r => r.room_name == room_name).FirstOrDefaultAsync();
            if (room == null) { return BadRequest(new { Message = "Room is not found" }); }

            DateTime date = DateTime.Parse(time);

            if((appointment.appointment_status == Appointment_status.Canceled) || (appointment.appointment_status == Appointment_status.Completed))
            {
                return BadRequest(new { Message = "Can't change doctor because appointment status is " + appointment.appointment_status });
            }

            var lastAppointment = _context.Appointments.Where(a => a.appointment_doctor_id  == user.user_id && a.appointment_time.Date == date.Date).OrderBy(a => a.appointment_ordinal_number).LastOrDefault();

            if(lastAppointment == null)
            {
                appointment.appointment_ordinal_number = 1;
            }
            else
            {
                appointment.appointment_ordinal_number = lastAppointment.appointment_ordinal_number + 1;
            }

            
            appointment.appointment_doctor_id = user.user_id;
            appointment.apointment_room_id = room.room_id;
            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            var checkUser = _context.Users.Where(u => u.user_id == appointment.appointment_user_id).FirstOrDefault();

            string from = _configuration["EmailSettings:From"];
            var emailModel = new Email(checkUser.user_email, "Change doctor Successfully", EmailBody.EmailChangeDoctor(room_name, (int)appointment.appointment_ordinal_number, user.user_fullName, user.user_email));
            _emailService.SendEmail(emailModel);

            return Ok(new { Message = "Change doctor is successfully" });
        }
    }
}
