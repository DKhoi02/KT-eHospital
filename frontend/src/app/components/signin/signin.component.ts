import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  SignInForm!: FormGroup;
  // @ViewChild('signInBtn') signInBtn!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private userStore: UserStoreService
  ) // private renderer: Renderer2
  {}

  ngOnInit(): void {
    this.SignInForm = this.fb.group({
      user_email: ['', Validators.required],
      user_password: ['', Validators.required],
    });
  }

  onSignIn() {
    if (this.SignInForm.valid) {
      // // Disable the submit button
      // this.renderer.setProperty(this.signInBtn.nativeElement, 'disabled', true);

      // // Enable the submit button after 5 seconds
      // setTimeout(() => {
      //   this.renderer.setProperty(
      //     this.signInBtn.nativeElement,
      //     'disabled',
      //     false
      //   );
      // }, 5000);
      // let userSignIn = {
      //   user_email: this.SignInForm.get('user_email')?.value,
      //   user_password: this.SignInForm.get('user_password')?.value,
      // };

      this.auth
        .signIn(
          this.SignInForm.get('user_email')?.value,
          this.SignInForm.get('user_password')?.value
        )
        .subscribe(
          (response) => {
            this.SignInForm.reset();
            this.auth.storeToken(response.accessToken);
            this.auth.storeRefreshToken(response.refreshToken);
            const tokenPayLoad = this.auth.decodedToken();
            this.userStore.setRoleForStore(tokenPayLoad.role);
            this.userStore.setEmailForStore(tokenPayLoad.email);
            if (tokenPayLoad.role == 'Admin') {
              this.router.navigate(['admin-account']);
            } else if (tokenPayLoad.role == 'Pharmacist')
              this.router.navigate(['pharmacist-confirm-appointment']);
            else if (tokenPayLoad.role == 'Doctor') {
              this.router.navigate(['doctor-medical-examination']);
            } else if (tokenPayLoad.role == 'Manager') {
              this.router.navigate(['manager-appointment']);
            } else {
              this.router.navigate(['/']);
            }
          },
          (error) => {
            Swal.fire(
              'Login Failed',
              'Please enter email or password again!',
              'error'
            );
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.SignInForm);
    }
  }
}
