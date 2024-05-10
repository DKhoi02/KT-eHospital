import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { UserModel } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.css'],
})
export class MainHeaderComponent implements OnInit {
  public currentUser!: string;
  public role!: string;
  public imgUrl!: string;
  public userModel!: UserModel;
  public appointmentForm!: FormGroup;
  public isBook: string = '';
  public isBookInvalid: string = '';
  public isChooseDateError: boolean = false;
  public quantityBooked!: number;
  public chooseDate: string = '';

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private appointment: AppointmentService
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      appointment_time: ['', [Validators.required, this.checkDateValidator()]],
    });

    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });

    this.userStore.getEmailFromStore().subscribe((val) => {
      const emailFromToken = this.auth.getEmailFromToken();
      this.currentUser = val || emailFromToken;
    });

    if (this.currentUser != null) {
      this.user.getCurrentUser(this.currentUser).subscribe(
        (res: any) => {
          this.userModel = res;
          this.imgUrl = this.userModel.user_image;
          this.isBook = '#exampleModalCenter';
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
  }

  onNavigatePage() {
    if (this.role == 'Admin') {
      this.router.navigate(['admin-account']);
    } else if (this.role == 'Pharmacist')
      this.router.navigate(['pharmacist-confirm-appointment']);
    else if (this.role == 'Doctor') {
      this.router.navigate(['doctor-medical-examination']);
    } else if (this.role == 'Manager') {
      this.router.navigate(['manager-appointment']);
    } else {
      this.router.navigate(['patient-appointment']);
    }
  }

  checkDateValidator(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      const currentDate = new Date();
      const enteredDate = new Date(control.value);
      if (enteredDate < currentDate) {
        this.isChooseDateError = true;
        return { checkDate: true };
      }
      this.isChooseDateError = false;
      return null;
    };
  }

  handleChooseDate(event: Event) {
    this.chooseDate = (event.target as HTMLInputElement).value;
    this.isBookInvalid = '';

    if (this.chooseDate != '' && new Date(this.chooseDate) >= new Date()) {
      this.isBookInvalid = 'modal';
    }
    this.chooseDate = formatDate(this.chooseDate, 'dd/MM/yyyy', 'en-US');
    this.appointment.getQuantityBooked(this.chooseDate).subscribe(
      (res: number) => {
        this.quantityBooked = res;
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

  onCheckBook() {
    if (this.currentUser == null) {
      Swal.fire({
        title: "You're not logged in",
        text: 'Please Sign In before booking an appointment. Sign In Now.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sign In Now',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['signin']);
        }
      });
    }
  }

// https://sweetalert2.github.io/images/nyan-cat.gif

  onBook() {
    if (
      this.appointmentForm.valid &&
      this.quantityBooked > 0 &&
      !this.isChooseDateError
    ) {
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

      this.appointment
        .bookAppointment(
          this.appointmentForm.get('appointment_time')?.value,
          this.userModel.user_id.toString()
        )
        .subscribe(
          (res) => {
            this.appointmentForm.reset();
            Swal.close();
            Swal.fire({
              title: 'Book Appointment successfully',
              text: 'To learn more details about your booked appointment, please navigate to the appointment details page.',
              icon: 'success',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Go to now',
              reverseButtons: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['patient-view-appointment', res]);
              }
            });
          },
          (err) => {
            Swal.close();
            Swal.fire({
              title: 'Book appointment already exists',
              text: err.message,
              icon: 'warning',
            });
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.appointmentForm);
    }
  }

  onSignOut() {
    this.auth.signOut();
  }
}
