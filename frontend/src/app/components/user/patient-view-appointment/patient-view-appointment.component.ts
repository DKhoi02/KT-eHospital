import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { UserModel } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PrescriptionService } from 'src/app/services/prescription.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-view-appointment',
  templateUrl: './patient-view-appointment.component.html',
  styleUrls: ['./patient-view-appointment.component.css'],
})
export class PatientViewAppointmentComponent implements OnInit {
  @ViewChild('tableRef') tableRef!: ElementRef;

  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';
  public updateAppointmentForm!: FormGroup;

  isShow: string = '';
  appointmentID: number = 0;

  lstYear: any = [];
  getCurrentYear: number = 0;

  lstDayOfWeeks: any = [];
  lstWeekOfYear: any = [];
  currentWeek: any;

  lstDoctor: any = [];
  room_name: string = '';

  lstData: any = [];
  lstPrescription: any = [];

  public searchData: string = '';

  fullname: string = '';
  email: string = '';
  phoneNumber: string = '';
  birthday: string = '';
  gender: string = '';
  address: string = '';
  symptom: string = '';
  appointment_date: string = '';
  doctor_email: string = '';
  doctor_name: string = '';
  pharmacist_email: string = '';
  pharmacist_name: string = '';
  status: string = '';
  no: number = 0;
  totalAppointment: number = 0;
  public fullName: string = '';

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private roomService: RoomService,
    private scheduleService: ScheduleService,
    private activatedRouter: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.appointmentID = +this.dataService.getPatientViewAppointment();

    this.userStore.getEmailFromStore().subscribe((val) => {
      const emailFromToken = this.auth.getEmailFromToken();
      this.currentUser = val || emailFromToken;
    });

    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.roleName = val || roleFromToken;
    });

    if (this.currentUser != null) {
      this.user.getCurrentUser(this.currentUser).subscribe(
        (res: any) => {
          this.userModel = res;
          this.imgUrl = this.userModel.user_image;
          this.fullName = this.userModel.user_fullName;
        },
        (err) => {
          Swal.fire({
            title: 'Response error from server',
            text: 'No response from the server. Please reload the page or wait a moment.',
            icon: 'error',
          });
        }
      );
    }

    this.prescriptionService
      .getAllAppointmentByID(this.appointmentID)
      .subscribe((res: any) => {
        this.lstData = res.reverse();
        this.convertToString();
        this.lstPrescription = this.lstData;
      });

    this.appointmentService
      .getUserByAppointment(this.appointmentID)
      .subscribe((res: any) => {
        console.log(res);
        this.fullname = res.user_fullName;
        this.email = res.user_email;
        this.phoneNumber = res.user_phoneNumber;
        this.birthday = moment(new Date(res.user_birthDate)).format(
          'YYYY/MM/DD'
        );
        this.address = res.user_address;
        this.gender = res.user_gender;
        this.symptom = res.symptom;
        this.appointment_date = moment(new Date(res.appointment_date)).format(
          'YYYY/MM/DD'
        );
        this.doctor_email = res.doctor_email;
        this.doctor_name = res.doctor_name;
        this.pharmacist_email = res.pharmacist_email;
        this.pharmacist_name = res.pharmacist_name;
        this.room_name = res.room_name;
        this.status = res.status;
        this.no = res.no;
        this.totalAppointment = res.total_appointment;
      });
  }

  convertToString() {
    this.lstData.forEach((item: any) => {
      for (const prop in item) {
        if (item == null) {
          continue;
        }
        if (item.hasOwnProperty(prop)) {
          if (item[prop] == null) {
            continue;
          }
          if (typeof item[prop] !== 'string') {
            item[prop] = item[prop].toString();
          }
        }
      }
    });
  }

  onChageSearch(event: any) {
    this.searchData = event.target.value;
    if (this.searchData == '') {
      this.lstPrescription = this.lstData;
    } else {
      this.lstPrescription = this.lstData.filter((user: any) =>
        Object.values(user).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(this.searchData)
        )
      );
      this.highlightKeyword(this.searchData);
    }
  }

  highlightKeyword(text: string): SafeHtml {
    if (!this.searchData.trim()) {
      return text;
    }
    const regex = new RegExp(this.searchData, 'gi');
    const highlightedText = text.replace(
      regex,
      (match) =>
        `<span style="background-color: yellow !important;">${match}</span>`
    );
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  onSignOut() {
    this.auth.signOut();
  }

  handleFileInput(event: any) {
    const fileToUpload: File = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(fileToUpload);
    reader.onload = () => {
      this.imgUrl = reader.result as string;
    };

    this.user.updateImage(fileToUpload, this.currentUser).subscribe(
      (res) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Update image successfully',
          showConfirmButton: false,
          timer: 2000,
        });
        setTimeout(() => this.ngOnInit(), 0);
      },
      (err) => {
        Swal.fire({
          title: 'Update image unsuccessful',
          text: 'Update image unsuccessful. Please try again.',
          icon: 'error',
        });
      }
    );
  }
}
