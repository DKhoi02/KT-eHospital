import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import ValidateForm from 'src/app/helpers/validateForms';
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
  selector: 'app-doctor-history-patient',
  templateUrl: './doctor-history-patient.component.html',
  styleUrls: ['./doctor-history-patient.component.css'],
})
export class DoctorHistoryPatientComponent implements OnInit {
  @ViewChild('tableRef') tableRef!: ElementRef;

  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';

  isShow: string = '';
  appointmentID: number = 0;

  lstYear: any = [];
  getCurrentYear: number = 0;

  lstDayOfWeeks: any = [];
  lstWeekOfYear: any = [];
  currentWeek: any;

  lstDoctor: any = [];
  lstRoom: any = [];

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
  appointment_date = '';
  doctor_email = '';
  doctor_name = '';
  pharmacist_email = '';
  pharmacist_name = '';
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
    // this.activatedRouter.params.subscribe((params: any) => {
    //   this.appointmentID = +params['id'];
    // });

    this.appointmentID = +this.dataService.getDoctorHistoryPatient();

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
        this.fullname = res.user_fullName;
        this.email = res.user_email;
        this.phoneNumber = res.user_phoneNumber;
        (this.birthday = moment(new Date(res.user_birthDate)).format(
          'YYYY/MM/DD'
        )),
          (this.address = res.user_address);
        this.gender = res.user_gender;
        this.symptom = res.symptom;
        this.appointment_date = res.appointment_date;
        this.doctor_email = res.doctor_email;
        this.doctor_name = res.doctor_name;
        this.pharmacist_email = res.pharmacist_email;
        this.pharmacist_name = res.pharmacist_name;
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
