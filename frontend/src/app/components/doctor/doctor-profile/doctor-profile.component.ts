import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import ValidateForm from 'src/app/helpers/validateForms';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public profileForm!: FormGroup;
  public roleName: string = '';
  public file: any;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
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
      user_gender: [''],
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
          this.profileForm.patchValue({
            user_fullName: this.userModel.user_fullName,
            user_email: this.userModel.user_email,
            user_phoneNumber: this.userModel.user_phoneNumber,
            user_address: this.userModel.user_address,
            user_birthDate: moment(
              new Date(this.userModel.user_birthDate)
            ).format('YYYY-MM-DD'),
            user_gender: this.userModel.user_gender,
          });
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

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  onSave() {
    if (this.profileForm.valid) {
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
      this.userModel.user_fullName = this.profileForm
        .get('user_fullName')
        ?.value.trim();
      this.userModel.user_email = this.profileForm
        .get('user_email')
        ?.value.trim();
      this.userModel.user_phoneNumber =
        this.profileForm.get('user_phoneNumber')?.value;
      this.userModel.user_birthDate = this.profileForm
        .get('user_birthDate')
        ?.value.trim();
      this.userModel.user_address = this.profileForm
        .get('user_address')
        ?.value.trim();
      this.userModel.user_gender = this.profileForm
        .get('user_gender')
        ?.value.trim();

      this.user.updateProfile(this.userModel).subscribe(
        (res) => {
          Swal.close();
          this.auth.storeToken(res.accessToken);
          this.auth.storeRefreshToken(res.refreshToken);
          const tokenPayLoad = this.auth.decodedToken();

          this.userStore.setRoleForStore(tokenPayLoad.role);
          this.userStore.setEmailForStore(tokenPayLoad.email);

          this.userStore.getEmailFromStore().subscribe((val) => {
            const emailFromToken = this.auth.getEmailFromToken();
            this.currentUser = val || emailFromToken;
          });

          this.userStore.getRoleFromStore().subscribe((val) => {
            const roleFromToken = this.auth.getRoleFromToken();
            this.roleName = val || roleFromToken;
          });

          if (this.file != undefined) {
            const formData: FormData = new FormData();
            formData.append('uploadFile', this.file, this.file.name);
            this.user.uploadFileProfile(formData, this.currentUser).subscribe(
              (res) => {
                this.file = undefined;
                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Update Profile successfully',
                  showConfirmButton: false,
                  timer: 2000,
                });
              },
              (err) => {
                Swal.fire('Update Profile Failed', err.message, 'error');
              }
            );
          } else {
            Swal.close();
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Update Profile successfully',
              showConfirmButton: false,
              timer: 2000,
            });
          }
        },
        (err) => {
          Swal.fire('Update Profile Failed', err.message, 'error');
        }
      );
    } else {
      ValidateForm.validateAllFormFields(this.profileForm);
    }
  }
}
