using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Regulations> Regulations { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<ClickBlog> ClickBlogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Role>().ToTable("Roles");
            modelBuilder.Entity<Regulations>().ToTable("Regulations");
            modelBuilder.Entity<Appointment>().ToTable("Appointments");
            modelBuilder.Entity<Room>().ToTable("Rooms");
            modelBuilder.Entity<Schedule>().ToTable("Schedules");
            modelBuilder.Entity<Medicine>().ToTable("Medicines");
            modelBuilder.Entity<Blog>().ToTable("Blogs");
            modelBuilder.Entity<ClickBlog>().ToTable("ClickBlogs");

           modelBuilder.Entity<Appointment>()
                .HasOne(a => a.user)
                .WithMany(u => u.appointments)
                .HasForeignKey(a => a.appointment_user_id)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.doctor)
                .WithMany()
                .HasForeignKey(a => a.appointment_doctor_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.pharmacist)
                .WithMany()
                .HasForeignKey(a => a.appointment_pharmacist_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
