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
      this.resetService
        .sendResetPasswordLink(this.ForgetPasswordForm.get('user_email')?.value)
        .subscribe({
          next: (res) => {
            Swal.fire(
              'Reset password link sent successfully',
              'The reset link has been sent to you. Please check your email.',
              'success'
            );
          },
          error: (err) => {
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
