using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("statistic")]
    [ApiController]
    public class StatisticController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatisticController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("total-statistic")]
        public async Task<IActionResult> totalStatistic()
        {
            var total = _context.Appointments.Select(a => new
            {
                total_revenue = _context.Prescriptions.Select(p => p.prescription_total).Sum(),
                total_user = _context.Users.Count(),
                total_appointment = _context.Appointments.Count(),
                total_blog = _context.Blogs.Count()
            }).FirstOrDefault();

            return Ok(total);
        }

        [HttpGet("date-statistic")]
        public async Task<IActionResult> dateStatistic(string dateFrom, string dateTo)
        {
            if (string.IsNullOrEmpty(dateFrom) || string.IsNullOrEmpty(dateTo)) 
                return BadRequest(new {Message = "Please enter full from and to date"});

            DateTime from = DateTime.Parse(dateFrom);
            DateTime to = DateTime.Parse(dateTo);

            if(from.Date>to.Date) { return BadRequest(new { Message = "From date need least than to date" }); }

            var checkDateFrom = _context.Appointments.Where(a => a.appointment_time.Date ==  from).FirstOrDefault();
            if (checkDateFrom == null)
                return BadRequest(new {Message = "Can't not find data of from date. Please enter different date" });

            var checkDateTo = _context.Appointments.Where(a => a.appointment_time.Date == to).FirstOrDefault();
            if (checkDateFrom == null)
                return BadRequest(new { Message = "Can't not find data of to date. Please enter different date" });

            var data = _context.Appointments.Where(a => a.appointment_time >= from && a.appointment_time <= to)
                                            .GroupBy(ap => ap.appointment_status)
                                            .Select(a => new {                                                
                                                status = a.Key,
                                                quantity_appointment = a.Count()
                                            }).ToList();
            var getAppointment = _context.Appointments.Where(a => a.appointment_time >= from && a.appointment_time <= to).ToList();

            int total = 0;

            foreach(var item in getAppointment) 
            {
                total = total + (int)_context.Prescriptions.Where(p => p.prescription_appointment_id == item.appointment_id).Sum(p => p.prescription_total);
            }

            return Ok(new {data = data,  total = total});
        }

        [HttpGet("get-revenue-prediction")]
        public async Task<IActionResult> getRevenuePrediction()
        {

            //var appointment = _context.Appointments.Where(a => a.appointment_status == Appointment_status.Completed
            //                                                && a.appointment_time <= DateTime.Parse("2023-12-31")).OrderBy(a => a.appointment_time.Date).ToList();
            var appointment = _context.Appointments.Where(a => a.appointment_status == Appointment_status.Completed).OrderBy(a => a.appointment_time.Date).ToList();
            DateTime startDate = appointment.Select(a => a.appointment_time.Date).First();
            DateTime endDate = appointment.Select(a => a.appointment_time.Date).Last();

            List<decimal> revenue = new List<decimal>();

            foreach (var item in appointment.GroupBy(a => a.appointment_time))
            {
                var getAppointment = _context.Appointments.Where(a => a.appointment_time.Date == item.Key.Date).ToList();
                decimal totalRevenue = 0;
                foreach(var a in getAppointment)
                {
                    totalRevenue += (decimal)_context.Prescriptions.Where(p => p.prescription_appointment_id == a.appointment_id).Sum(p => p.prescription_total);
                }
                revenue.Add(totalRevenue);
            }

            return Ok(new {startDate = startDate.Date, endDate = endDate.Date, revenue = revenue });
        }
    }
}
