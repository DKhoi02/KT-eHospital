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
import { DataService } from 'src/app/services/data.service';
import { MedicineService } from 'src/app/services/medicine.service';
import { PrescriptionService } from 'src/app/services/prescription.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-prescription',
  templateUrl: './add-prescription.component.html',
  styleUrls: ['./add-prescription.component.css'],
})
export class AddPrescriptionComponent implements OnInit {
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

  lstData: any = [];
  lstPrescription: any = [];

  public searchData: string = '';

  lstMedicine: any = [];

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
    private medicineService: MedicineService,
    private prescriptionService: PrescriptionService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      medicine_name: ['', [Validators.required, this.checkMedicine()]],
      medicine_total: ['', [Validators.required, this.checkNumber()]],
      medicine_number_perday: ['', [Validators.required, this.checkNumber()]],
      medicine_eachtime_pill: ['', [Validators.required, this.checkNumber()]],
    });

    // this.activatedRouter.params.subscribe((params: any) => {
    //   this.appointmentID = +params['id'];
    // });

    this.appointmentID = +this.dataService.getDoctorAddPrescription();

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

    this.medicineService.getAllMedicineByStatus().subscribe((res: any) => {
      this.lstMedicine = res;
    });

    this.prescriptionService
      .getAllAppointmentByID(this.appointmentID)
      .subscribe((res) => {
        this.lstData = res;
        this.convertToString();
        this.lstPrescription = this.lstData.reverse();
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

  checkNumber(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      const value: string = control.value;
      if (!/^\d+$/.test(value)) {
        return { isNotNumber: true };
      }
      return null;
    };
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

  onSave() {
    if (this.patientForm.valid) {
      Swal.fire({
        html: `
    <div id="background" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999; background-color: rgba(0, 0, 0, 0.5);"></div>
    <img id="image" src="assets/img/loading.gif" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; display: none;">
  `,
        width: 0,
        showConfirmButton: false,
      });

      setTimeout(() => {
        const image = document.getElementById('image');
        if (image) {
          image.style.display = 'block';
        }
      }, 500);
      this.prescriptionService
        .addPrescription(
          this.currentUser,
          this.appointmentID,
          this.patientForm.get('medicine_name')?.value,
          this.patientForm.get('medicine_total')?.value,
          this.patientForm.get('medicine_number_perday')?.value,
          this.patientForm.get('medicine_eachtime_pill')?.value
        )
        .subscribe(
          (res) => {
            Swal.close();
            this.prescriptionService
              .getAllAppointmentByID(this.appointmentID)
              .subscribe((res) => {
                this.lstData = res;
                this.convertToString();
                if (this.searchData == '') {
                  this.lstPrescription = this.lstData.reverse();
                } else {
                  this.lstPrescription = this.lstData
                    .reverse()
                    .filter((medicine: any) =>
                      Object.values(medicine).some(
                        (value) =>
                          typeof value === 'string' &&
                          value.toLowerCase().includes(this.searchData)
                      )
                    );
                  this.highlightKeyword(this.searchData);
                }
                this.lstPrescription = this.lstData.reverse();
              });
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Add successfully',
              showConfirmButton: false,
              timer: 2000,
            });
            this.patientForm.reset();
          },
          (err) => {
            Swal.close();
            Swal.fire({
              title: 'Add unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.patientForm);
    }
  }

  onConfirm() {
    Swal.fire({
      title: 'Are you sure confirm appointment?',
      text: '',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService
          .confirmAppointment(this.appointmentID)
          .subscribe(
            (res) => {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Confirm appointment successfully',
                showConfirmButton: false,
                timer: 2000,
              });
              this.router.navigate(['doctor-medical-examination']);
            },
            (err) => {
              Swal.fire({
                title: 'Confirm appointment unsuccessful',
                text: err.message,
                icon: 'error',
              });
            }
          );
      }
    });
  }

  onDelete(id: number) {
    this.prescriptionService.deletePrescription(id).subscribe((res) => {
      this.prescriptionService
        .getAllAppointmentByID(this.appointmentID)
        .subscribe((res) => {
          this.lstData = res;
          this.convertToString();
          if (this.searchData == '') {
            this.lstPrescription = this.lstData.reverse();
          } else {
            this.lstPrescription = this.lstData
              .reverse()
              .filter((medicine: any) =>
                Object.values(medicine).some(
                  (value) =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(this.searchData)
                )
              );
            this.highlightKeyword(this.searchData);
          }
        });
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Delete successfully',
        showConfirmButton: false,
        timer: 2000,
      });
    });
  }

  checkMedicine(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      if (
        !this.lstMedicine.find(
          (medicine: { medicine_name: any }) =>
            medicine.medicine_name == control.value
        )
      ) {
        return { isWrongMedicine: true };
      }
      return null;
    };
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
