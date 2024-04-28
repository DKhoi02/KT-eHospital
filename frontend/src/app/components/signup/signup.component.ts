import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  SignUpForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.SignUpForm = this.fb.group({
      user_fullName: ['', [Validators.required]],
      user_email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'),
        ],
      ],
      user_phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^(03|05|07|08|09)[0-9]{8}$')],
      ],
      user_birthDate: ['', [Validators.required, this.birthdateValidator()]],
      user_address: ['', Validators.required],
      user_gender: ['Male'],
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
  }

  birthdateValidator(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      const currentDate = new Date();
      const enteredDate = new Date(control.value);
      if (enteredDate > currentDate) {
        return { futureDate: true };
      }
      return null;
    };
  }

  onSignUp() {
    if (this.SignUpForm.valid) {

      enum status {UnLock}

      let userSignUp = {
        user_fullName: this.SignUpForm.get('user_fullName')?.value.trim(),
        user_email: this.SignUpForm.get('user_email')?.value.trim(),
        user_phoneNumber: this.SignUpForm.get('user_phoneNumber')?.value,
        user_birthDate: this.SignUpForm.get('user_birthDate')?.value,
        user_address: this.SignUpForm.get('user_address')?.value.trim(),
        user_gender: this.SignUpForm.get('user_gender')?.value,
        user_password: this.SignUpForm.get('user_password')?.value.replace(
          /\s/g,
          ''
        ),
        user_image: "avatar",
        user_status: status.UnLock,
        user_quantity_canceled: 0
      };
      this.auth.signUp(userSignUp).subscribe(
        (response) => {
          this.SignUpForm.reset();
          Swal.fire('Registration successfully', 'Sing In Now' , 'success');
          this.router.navigate(['signin']);
        },
        (error: any) => {
          Swal.fire('Registration Failed', error.message, 'error');
        }
      );
    } else {
      ValidateForm.validateAllFormFields(this.SignUpForm);
    }
  }
}

