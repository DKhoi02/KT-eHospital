using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class v1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Blogs",
                columns: table => new
                {
                    blog_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    blog_title = table.Column<string>(type: "varchar(255)", nullable: false),
                    blog_demo = table.Column<string>(type: "varchar(255)", nullable: false),
                    blog_img = table.Column<string>(type: "varchar(255)", nullable: false),
                    blog_content = table.Column<string>(type: "varchar(255)", nullable: false),
                    blog_status = table.Column<string>(type: "varchar(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blogs", x => x.blog_id);
                });

            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    medicine_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    medicine_name = table.Column<string>(type: "varchar(255)", nullable: false),
                    medicine_quantity = table.Column<int>(type: "int", nullable: false),
                    medicine_price = table.Column<double>(type: "float", nullable: false),
                    medicine_image = table.Column<string>(type: "varchar(255)", nullable: false),
                    medicine_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    medicine_description = table.Column<string>(type: "varchar(255)", nullable: false),
                    medicine_status = table.Column<string>(type: "varchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicines", x => x.medicine_id);
                });

            migrationBuilder.CreateTable(
                name: "Regulations",
                columns: table => new
                {
                    regulation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    regulation_quantity_appointment = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regulations", x => x.regulation_id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_name = table.Column<string>(type: "varchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    room_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_name = table.Column<string>(type: "varchar(255)", nullable: false),
                    room_status = table.Column<string>(type: "varchar(255)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.room_id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_fullName = table.Column<string>(type: "varchar(255)", nullable: false),
                    user_email = table.Column<string>(type: "varchar(255)", nullable: false),
                    user_phoneNumber = table.Column<string>(type: "varchar(50)", nullable: false),
                    user_birthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    user_address = table.Column<string>(type: "varchar(255)", nullable: false),
                    user_gender = table.Column<string>(type: "varchar(10)", nullable: false),
                    user_image = table.Column<string>(type: "varchar(255)", nullable: false),
                    user_password = table.Column<string>(type: "varchar(255)", nullable: false),
                    user_status = table.Column<string>(type: "varchar(10)", nullable: false),
                    user_quantity_canceled = table.Column<int>(type: "int", nullable: false),
                    user_introduction = table.Column<string>(type: "varchar(1000)", nullable: true),
                    user_token = table.Column<string>(type: "varchar(255)", nullable: true),
                    user_refreshToken = table.Column<string>(type: "varchar(255)", nullable: true),
                    user_refreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    user_resetPasswordToken = table.Column<string>(type: "varchar(255)", nullable: true),
                    user_resetPasswordExpiry = table.Column<DateTime>(type: "datetime2", nullable: false),
                    user_role_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_user_role_id",
                        column: x => x.user_role_id,
                        principalTable: "Roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    appointment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    appointment_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    appointment_status = table.Column<string>(type: "varchar(255)", nullable: false),
                    appointment_ordinal_number = table.Column<int>(type: "int", nullable: true),
                    appointment_symptom = table.Column<string>(type: "varchar(2000)", nullable: true),
                    appointment_user_id = table.Column<int>(type: "int", nullable: false),
                    appointment_doctor_id = table.Column<int>(type: "int", nullable: true),
                    appointment_pharmacist_id = table.Column<int>(type: "int", nullable: true),
                    appointment_regulation_id = table.Column<int>(type: "int", nullable: false),
                    apointment_room_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.appointment_id);
                    table.ForeignKey(
                        name: "FK_Appointments_Regulations_appointment_regulation_id",
                        column: x => x.appointment_regulation_id,
                        principalTable: "Regulations",
                        principalColumn: "regulation_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Appointments_Rooms_apointment_room_id",
                        column: x => x.apointment_room_id,
                        principalTable: "Rooms",
                        principalColumn: "room_id");
                    table.ForeignKey(
                        name: "FK_Appointments_Users_appointment_doctor_id",
                        column: x => x.appointment_doctor_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Users_appointment_pharmacist_id",
                        column: x => x.appointment_pharmacist_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Users_appointment_user_id",
                        column: x => x.appointment_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClickBlogs",
                columns: table => new
                {
                    click_blog_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    click_blog_count = table.Column<int>(type: "int", nullable: false),
                    click_blog_user_id = table.Column<int>(type: "int", nullable: false),
                    click_blog_blog_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClickBlogs", x => x.click_blog_id);
                    table.ForeignKey(
                        name: "FK_ClickBlogs_Blogs_click_blog_blog_id",
                        column: x => x.click_blog_blog_id,
                        principalTable: "Blogs",
                        principalColumn: "blog_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClickBlogs_Users_click_blog_user_id",
                        column: x => x.click_blog_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    schedule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    schedule_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    schedule_doctor_id = table.Column<int>(type: "int", nullable: true),
                    schedule_room_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.schedule_id);
                    table.ForeignKey(
                        name: "FK_Schedules_Rooms_schedule_room_id",
                        column: x => x.schedule_room_id,
                        principalTable: "Rooms",
                        principalColumn: "room_id");
                    table.ForeignKey(
                        name: "FK_Schedules_Users_schedule_doctor_id",
                        column: x => x.schedule_doctor_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    prescription_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    prescription_quantity = table.Column<int>(type: "int", nullable: false),
                    prescription_price = table.Column<double>(type: "float", nullable: false),
                    prescription_total = table.Column<double>(type: "float", nullable: false),
                    prescription_number_medicine_perday = table.Column<int>(type: "int", nullable: false),
                    prescription_eachtime_take = table.Column<int>(type: "int", nullable: false),
                    prescription_appointment_id = table.Column<int>(type: "int", nullable: false),
                    prescription_medicine_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.prescription_id);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Appointments_prescription_appointment_id",
                        column: x => x.prescription_appointment_id,
                        principalTable: "Appointments",
                        principalColumn: "appointment_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Medicines_prescription_medicine_id",
                        column: x => x.prescription_medicine_id,
                        principalTable: "Medicines",
                        principalColumn: "medicine_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_apointment_room_id",
                table: "Appointments",
                column: "apointment_room_id");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_appointment_doctor_id",
                table: "Appointments",
                column: "appointment_doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_appointment_pharmacist_id",
                table: "Appointments",
                column: "appointment_pharmacist_id");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_appointment_regulation_id",
                table: "Appointments",
                column: "appointment_regulation_id");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_appointment_user_id",
                table: "Appointments",
                column: "appointment_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ClickBlogs_click_blog_blog_id",
                table: "ClickBlogs",
                column: "click_blog_blog_id");

            migrationBuilder.CreateIndex(
                name: "IX_ClickBlogs_click_blog_user_id",
                table: "ClickBlogs",
                column: "click_blog_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_prescription_appointment_id",
                table: "Prescriptions",
                column: "prescription_appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_prescription_medicine_id",
                table: "Prescriptions",
                column: "prescription_medicine_id");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_schedule_doctor_id",
                table: "Schedules",
                column: "schedule_doctor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_schedule_room_id",
                table: "Schedules",
                column: "schedule_room_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_user_role_id",
                table: "Users",
                column: "user_role_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClickBlogs");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "Schedules");

            migrationBuilder.DropTable(
                name: "Blogs");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Medicines");

            migrationBuilder.DropTable(
                name: "Regulations");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
