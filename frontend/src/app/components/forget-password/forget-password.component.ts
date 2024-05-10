import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { AuthService } from 'src/app/services/auth.service';
import { ResetPasswordService } from 'src/app/services/reset-password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
})
export class ForgetPasswordComponent implements OnInit {
  ForgetPasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private resetService: ResetPasswordService
  ) {}

  ngOnInit(): void {
    this.ForgetPasswordForm = this.fb.group({
      user_email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'),
        ],
      ],
    });
  }

  onForgetPassword() {
    if (this.ForgetPasswordForm.valid) {
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
      this.resetService
        .sendResetPasswordLink(this.ForgetPasswordForm.get('user_email')?.value)
        .subscribe({
          next: (res) => {
            Swal.close();
            Swal.fire(
              'Reset password link sent successfully',
              'The reset link has been sent to you. Please check your email.',
              'success'
            );
          },
          error: (err) => {
            Swal.close();
            Swal.fire(
              'Failed to send reset password link',
              'The email address you provided is incorrect. Please enter your email again.',
              'error'
            );
          },
        });
    } else {
      ValidateForm.validateAllFormFields(this.ForgetPasswordForm);
    }
  }
}
