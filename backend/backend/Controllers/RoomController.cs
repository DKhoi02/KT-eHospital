using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("room")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> getRooms()
        {
            return Ok(await _context.Rooms.ToListAsync());
        }

        [HttpGet("get-all-room")]
        public async Task<IActionResult> getAllRoom()
        {
            return Ok(await _context.Rooms.Where(r => r.room_status == Room_status.Available).ToListAsync());
        }

        [HttpGet("get-room-by-id")]
        public async Task<IActionResult> getRoomById(int id)
        {
            if (id == 0 || id == null) { return BadRequest(new { Message = "Data Provided is null" }); }

            var checkRoom = await _context.Rooms.Where(r => r.room_id == id).FirstOrDefaultAsync();

            if (checkRoom == null) { return BadRequest(new { Message = "Room is not found" });  }

            return Ok(checkRoom);
        }

        [HttpPost("update-status-room")]
        public async Task<IActionResult> updateStatusRoom(int id, string name, string status)
        {
            if(id == 0 || id == null || string.IsNullOrEmpty(status) || string.IsNullOrEmpty(name)) { return BadRequest(new { Message = "Data Provided is null" });}

            var checkRoom = await _context.Rooms.Where(r => r.room_id == id).FirstOrDefaultAsync();

            if (checkRoom == null) { return BadRequest(new { Message = "Room is not found" }); }

            if(checkRoom.room_name != name) {
                var existRoom = _context.Rooms.Any(r => r.room_name == name);
                if(existRoom) { return BadRequest(new { Message = "The Room Name is already exist" }); }
            }

            checkRoom.room_name = name;

            checkRoom.room_status = Room_status.Available;
            if (status.Equals("Unavailable"))
            {
                checkRoom.room_status = Room_status.Unavailable;
            }

            _context.Entry(checkRoom).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(new {Message="Update Room Status successfully"});
        }

        [HttpPost("add-new-room")]
        public async Task<IActionResult> addNewRoom(string name, string status)
        {
            if (string.IsNullOrEmpty(status) || string.IsNullOrEmpty(name)) { return BadRequest(new { Message = "Data Provided is null" }); }

            var existRoom = _context.Rooms.Any(r => r.room_name == name);
            if (existRoom) { return BadRequest(new { Message = "The Room Name is already exist" }); }

            Room room = new Room();     

            room.room_name = name;

            room.room_status = Room_status.Available;
            if (status.Equals("Unavailable"))
            {
                room.room_status = Room_status.Unavailable;
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Add Room Status successfully" });
        }
    }
}
