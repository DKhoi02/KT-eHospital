import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { ResetPassword } from 'src/app/models/reset-password.model';
import { AuthService } from 'src/app/services/auth.service';
import { ResetPasswordService } from 'src/app/services/reset-password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  ResetPassForm!: FormGroup;
  emailToReset!: string;
  emailToken!: string;
  resetPasswordObj = new ResetPassword();
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private resetService: ResetPasswordService
  ) {}

  ngOnInit(): void {
    this.ResetPassForm = this.fb.group({
      user_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{8,}$'
          ),
        ],
      ],
      user_confirmPassword: ['', [Validators.required]],
    });

    this.activatedRoute.queryParams.subscribe((val) => {
      this.emailToReset = val['email'];
      let uriToken = val['code'];
      this.emailToken = uriToken.replace(/ /g, '+');
    });
  }

  onResetPassword() {
    if (this.ResetPassForm.valid) {
      this.resetPasswordObj.resetPass_email = this.emailToReset;
      this.resetPasswordObj.resetPass_newPassword =
        this.ResetPassForm.get('user_password')?.value;
      this.resetPasswordObj.resetPass_confirmPassword = this.ResetPassForm.get(
        'user_confirmPassword'
      )?.value;
      this.resetPasswordObj.resetPass_emailToken = this.emailToken;

      this.resetService.resetPassword(this.resetPasswordObj).subscribe({
        next: (res) => {
          Swal.fire(
            'Reset password successfully',
            'Reset password successfully. Sign In Now',
            'success'
          );
          this.router.navigate(['signin']);
        },
        error: (err) => {
          Swal.fire({
            title: 'Reset password error',
            text: err.message,
            icon: 'error',
          });
        },
      });
    } else {
      ValidateForm.validateAllFormFields(this.ResetPassForm);
    }
  }
}
