using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("schedule")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ScheduleController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> getSchedule()
        {
            return Ok(await _context.Schedules.ToListAsync());
        }

        [HttpGet("get-all-schedule")]
        public async Task<IActionResult> getAllSchedule(string date)
        {
            if (string.IsNullOrEmpty(date)) { return BadRequest(new {Message = "Data provided is null"}); }

            DateTime time = DateTime.Parse(date);
            var data = await _context.Schedules.Where(s => s.schedule_date == time).Select(s => new {
                schedule_id = s.schedule_id,
                user_image = _context.Users.Where(u => u.user_id == s.schedule_doctor_id).Select(u => u.user_image).FirstOrDefault(),
                user_email = _context.Users.Where(u => u.user_id == s.schedule_doctor_id).Select(u => u.user_email).FirstOrDefault(),
                user_username = _context.Users.Where(u => u.user_id == s.schedule_doctor_id).Select(u => u.user_fullName).FirstOrDefault(),
                room_name = _context.Rooms.Where(r => r.room_id == s.schedule_room_id).Select(r => r.room_name).FirstOrDefault()
            }).ToListAsync();
            return Ok(data);
        }

        [HttpPost("add-schedule")]
        public async Task<IActionResult> addSchedule(string email, string room,string date)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(room) || string.IsNullOrEmpty(date))
            { return BadRequest(new { Message = "Data is provided is null" }); }

            var checkUser = await _context.Users.Where(u => u.user_email == email).FirstOrDefaultAsync();
            if (checkUser == null) { return BadRequest(new { Message = "Doctor is not found" }); }

            var checkRoom = await _context.Rooms.Where(r => r.room_name == room).FirstOrDefaultAsync();
            if (checkRoom == null) { return BadRequest(new { Message = "Room is not found" }); }

            DateTime dateSchedule = DateTime.Parse(date);

            if(dateSchedule.Date < DateTime.Now.Date) { return BadRequest(new { Message = "Can't update or add new Schedule of the past" }); }

            var checkScheduleDoctor = await _context.Schedules.Where(s => s.schedule_doctor_id == checkUser.user_id && s.schedule_date == dateSchedule).FirstOrDefaultAsync();

            if(checkScheduleDoctor != null) { return BadRequest(new { Message = "The Schedule of " + checkUser.user_fullName + " is already exist" }); }

            var checkScheduleRoom = await _context.Schedules.Where(s => s.schedule_room_id == checkRoom.room_id && s.schedule_date == dateSchedule).FirstOrDefaultAsync();

            if (checkScheduleRoom != null) { return BadRequest(new { Message = "The Schedule of " + checkRoom.room_name + " is already exist" }); }

  
            Schedule schedule = new Schedule();
            schedule.schedule_date = dateSchedule;
            schedule.schedule_room_id = checkRoom.room_id;
            schedule.schedule_doctor_id = checkUser.user_id;

            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Add Schedule successfull" });
        }

        [HttpDelete("delete-schedule")]
        public async Task<IActionResult> deleteSchedule(int id)
        {
            if (id == null || id == 0) return BadRequest(new { Message = "Data Provided is null" });

            var schedule = await _context.Schedules.Where(s => s.schedule_id == id).FirstOrDefaultAsync();

            if (schedule == null) { return BadRequest(new { Message = "Schedule is not found" }); }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Delete Schedule successfully" });
        }

        [HttpGet("get-doctor-change-appointment")]
        public async Task<IActionResult> getDoctorChangeAppointment(string time)
        {
            DateTime date = DateTime.Parse(time);
            var doctor = _context.Schedules.Where(s => s.schedule_date == date.Date)
                                           .Select(s => new
                                           {
                                               doctor_email = _context.Users.Where(u => u.user_id == s.schedule_doctor_id).Select(u => u.user_email).FirstOrDefault(),
                                               doctor_name = _context.Users.Where(u => u.user_id == s.schedule_doctor_id).Select(u => u.user_fullName).FirstOrDefault(),
                                               room_name = _context.Rooms.Where(r => r.room_id == s.schedule_room_id).Select(r => r.room_name).FirstOrDefault()
                                           }).ToList();
            return Ok(doctor);
        }

        [HttpGet("get-schedule-doctor")]
        public async Task<IActionResult> getScheduleDoctor(string email)
        {
            return Ok(await _context.Schedules.Where(s => s.schedule_doctor_id == _context.Users.Where(u => u.user_email == email).Select(u => u.user_id).FirstOrDefault()).ToListAsync());
        }
    }
}
