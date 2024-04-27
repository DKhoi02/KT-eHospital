
using backend.Context;
using backend.Helpers;
using backend.Models;
using backend.UtilityService;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DailyTask : BackgroundService
    {
      
        private readonly TimeSpan _timeSpan = TimeSpan.FromHours(24);
        private readonly IServiceProvider _serviceProvider;

        public DailyTask(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var now = DateTime.Now;
            var nextMidnight = now.Date.AddDays(1);
            var initialDelay = nextMidnight - now;

            await Task.Delay(initialDelay, stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var _configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                    var _emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    await checkCanceled(_context, _configuration, _emailService);
                    await setPatientRoom(_context, _configuration, _emailService);
                }

                await Task.Delay(_timeSpan, stoppingToken);
                //await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
            }
        }

        private async Task checkCanceled(AppDbContext _context, IConfiguration _configuration, IEmailService _emailService)
        {
            DateTime getDate = DateTime.Now.AddDays(-1).Date;

            var appointments = _context.Appointments.Where(a => a.appointment_time == getDate
                && a.appointment_status == Appointment_status.Scheduled).ToList();

            if (appointments != null)
            {
                foreach (var appointment in appointments)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.user_id == appointment.appointment_user_id);

                    user.user_quantity_canceled += 1;

                    if (user.user_quantity_canceled >= 3)
                    {
                        user.user_status = User_status.Lock;
                    }

                    appointment.appointment_status = Appointment_status.Canceled;

                    _context.Entry(appointment).State = EntityState.Modified;
                    _context.Entry(user).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    string from = _configuration["EmailSettings:From"];
                    var emailModel = new Email(user.user_email, "Cancel Appointment", EmailBody.EmailBookAutoCancel(appointment.appointment_time.Date.ToString()));
                    _emailService.SendEmail(emailModel);
                }
            }
        }

        private async Task setPatientRoom(AppDbContext _context, IConfiguration _configuration, IEmailService _emailService)
        {
            DateTime getDate = DateTime.Now.Date;
            
            var appointments = _context.Appointments.Where(a => a.appointment_time == getDate).ToList();

            if (appointments != null)
            {
                var rooms = await _context.Rooms.Where(r => r.room_status == Room_status.Available).ToListAsync();

                var countRoom = await _context.Rooms.CountAsync(r => r.room_status == Room_status.Available);
                var countAppointment = await _context.Appointments.CountAsync(a => a.appointment_time == getDate);

                int skip = 0;
                int take = countAppointment / countRoom;
                int temp = 1;
                int label = 0;

                for(int i = 0; i < take; i++)
                {
                    var getToSetRooms = _context.Appointments.Where(a => a.appointment_time == getDate)
                                                .Skip(skip*i).Take(countRoom).ToList();

                    for(int j = 0; j < take; j++)
                    {
                        getToSetRooms[j].appointment_ordinal_number = temp;
                        getToSetRooms[j].apointment_room_id = rooms[j].room_id;
                        _context.Entry(getToSetRooms[j]).State = EntityState.Modified;
                        await _context.SaveChangesAsync();

                        var user = await _context.Users.FirstOrDefaultAsync(u => u.user_id == getToSetRooms[j].appointment_user_id);

                        string from = _configuration["EmailSettings:From"];
                        var emailModel = new Email(user.user_email, "Book Appointment Successfully", EmailBody.EmailBookAutoSetRoom(rooms[j].room_name, temp));
                        _emailService.SendEmail(emailModel);
                    }
                    temp++;
                    skip = take;
                    label = take * (i + 1);
                }

                if (countAppointment % countRoom != 0)
                {
                    take = countAppointment % countRoom;

                    var getToSetRooms = _context.Appointments.Where(a => a.appointment_time == getDate)
                                                .Skip(label).Take(take).ToList();

                    for (int i = 0; i < take; i++)
                    {
                        getToSetRooms[i].appointment_ordinal_number = temp;
                        getToSetRooms[i].apointment_room_id = rooms[i].room_id;
                        _context.Entry(getToSetRooms[i]).State = EntityState.Modified;
                        await _context.SaveChangesAsync();

                        var user = await _context.Users.FirstOrDefaultAsync(u => u.user_id == getToSetRooms[i].appointment_user_id);
                        string from = _configuration["EmailSettings:From"];
                        var emailModel = new Email(user.user_email, "Book Appointment Successfully", EmailBody.EmailBookAutoSetRoom(rooms[i].room_name, temp));
                        _emailService.SendEmail(emailModel);
                    }
                }
            }
        }
    }
}
