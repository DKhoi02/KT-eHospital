import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  ContactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private userStore: UserStoreService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.ContactForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'),
        ],
      ],
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  onSend() {
    if (this.ContactForm.valid) {
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
      this.userService
        .contact(
          this.ContactForm.get('name')?.value,
          this.ContactForm.get('email')?.value,
          this.ContactForm.get('subject')?.value,
          this.ContactForm.get('message')?.value
        )
        .subscribe(
          (res) => {
            Swal.close();
            Swal.fire({
              title: 'Send contact successful',
              text: 'We will respond to you as soon as possible',
              icon: 'success',
            });
            this.ContactForm.reset();
          },
          (err) => {
            Swal.close();
            Swal.fire({
              title: 'Send contact unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.ContactForm);
    }
  }
}
