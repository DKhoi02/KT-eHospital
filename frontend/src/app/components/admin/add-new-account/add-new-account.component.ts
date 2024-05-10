import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-new-account',
  templateUrl: './add-new-account.component.html',
  styleUrls: ['./add-new-account.component.css'],
})
export class AddNewAccountComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  AddNewAccountForm!: FormGroup;
  public roleName: string = '';
  public lstUser: any = [];
  public lstData: any = [];
  public viewUser: any = [];
  public searchData: string = '';
  public imgUser: string = '';
  lstRoles: any = [];

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.AddNewAccountForm = this.fb.group({
      user_fullName: ['', [Validators.required, Validators.maxLength(255)]],
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
      user_address: ['', [Validators.required, Validators.maxLength(255)]],
      user_gender: ['Male'],
      user_role_id: ['', Validators.required],
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

    this.roleService.getAllRole().subscribe((res) => {
      this.lstRoles = res;
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

  onSelectRole(event: any): void {
    this.AddNewAccountForm.patchValue({
      user_role_id: event.target.value,
    });
  }

  onSignOut() {
    this.auth.signOut();
  }

  onAddNewAccount() {
    if (this.AddNewAccountForm.valid) {
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
      enum status {
        UnLock,
      }
      let userSignUp = {
        user_fullName:
          this.AddNewAccountForm.get('user_fullName')?.value.trim(),
        user_email: this.AddNewAccountForm.get('user_email')?.value.trim(),
        user_phoneNumber: this.AddNewAccountForm.get('user_phoneNumber')?.value,
        user_birthDate: this.AddNewAccountForm.get('user_birthDate')?.value,
        user_address: this.AddNewAccountForm.get('user_address')?.value.trim(),
        user_gender: this.AddNewAccountForm.get('user_gender')?.value,
        user_password: this.AddNewAccountForm.get(
          'user_password'
        )?.value.replace(/\s/g, ''),
        user_image: 'avatar',
        user_status: status.UnLock,
        user_quantity_canceled: 0,
        user_role_id: this.AddNewAccountForm.get('user_role_id')?.value,
      };
      this.auth.signUp(userSignUp).subscribe(
        (response) => {
          Swal.close();
          this.AddNewAccountForm.reset();
          Swal.fire('Add New Account successfully', '', 'success');
          this.router.navigate(['admin-account']);
        },
        (error: any) => {
          Swal.close();
          Swal.fire('Add New Account Failed', error.message, 'error');
        }
      );
    } else {
      ValidateForm.validateAllFormFields(this.AddNewAccountForm);
    }
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
