import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import ValidateForm from 'src/app/helpers/validateForms';
import { UserModel } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-medical-examination',
  templateUrl: './add-medical-examination.component.html',
  styleUrls: ['./add-medical-examination.component.css'],
})
export class AddMedicalExaminationComponent implements OnInit {
  @ViewChild('tableRef') tableRef!: ElementRef;

  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';
  public patientForm!: FormGroup;

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
  lstHistory: any = [];

  public searchData: string = '';

  fullname: string = '';
  email: string = '';
  phoneNumber: string = '';
  birthday: string = '';
  gender: string = '';
  address: string = '';
  pageSize = 5;
  currentPage = 1;
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
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      appointment_symptom: [
        '',
        [Validators.required, Validators.maxLength(2000)],
      ],
    });

    this.activatedRouter.params.subscribe((params: any) => {
      this.appointmentID = +params['id'];
    });

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

    this.appointmentService
      .getHistoryAppointmentByDoctor(this.appointmentID)
      .subscribe((res: any) => {
        this.lstData = res.reverse();
        this.lstHistory = this.lstData;
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
        this.patientForm.patchValue({
          appointment_symptom: res.symptom,
        });
      });
  }

  onChageSearch(event: any) {
    this.searchData = event.target.value;
    if (this.searchData == '') {
      this.lstHistory = this.lstData;
    } else {
      this.lstHistory = this.lstData.filter((user: any) =>
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

  onSave() {
    if (this.patientForm.valid) {
      this.appointmentService
        .addSymptom(
          this.appointmentID,
          this.patientForm.get('appointment_symptom')?.value,
          this.currentUser
        )
        .subscribe(
          (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Add Symptom successfully',
              showConfirmButton: false,
              timer: 2000,
            });
            this.patientForm.reset();
            this.router.navigate([
              'doctor-add-prescription',
              this.appointmentID,
            ]);
          },
          (err) => {
            Swal.fire({
              title: 'Add Symptom unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.patientForm);
    }
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
