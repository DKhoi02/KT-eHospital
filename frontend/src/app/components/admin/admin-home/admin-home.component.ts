import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
})
export class AdminHomeComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public viewProfileForm!: FormGroup;
  public roleName: string = '';
  public lstUser: any = [];
  public lstData: any = [];
  public viewUser: any = [];
  public searchData: string = '';
  public imgUser: string = '';

  pageSize = 5;
  currentPage = 1;

  @ViewChild('tableRef') tableRef!: ElementRef;

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
    this.viewProfileForm = this.fb.group({
      user_fullName: [''],
      user_email: [''],
      user_phoneNumber: [''],
      user_birthDate: [''],
      user_address: [''],
      user_gender: [''],
      user_status: [''],
      user_quantity_canceled: [''],
      user_role_name: [''],
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

    this.user.getAllUser().subscribe((res) => {
      this.lstData = res;
      this.lstUser = this.lstData;
    });
  }

  onChageSearch(event: any) {
    this.searchData = event.target.value;
    if (this.searchData == '') {
      this.lstUser = this.lstData;
    } else {
      this.lstUser = this.lstData.filter((user: any) =>
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

  onSignOut() {
    this.auth.signOut();
  }

  onView(user_email: string) {
    this.user.getCurrentUser(user_email).subscribe((res) => {
      this.viewUser = res;
      const role_name = this.lstData.find(
        (item: any) => item.user_email == user_email
      ).role_name;
      this.imgUser = this.viewUser.user_image;
      this.viewProfileForm.patchValue({
        user_fullName: this.viewUser.user_fullName,
        user_email: this.viewUser.user_email,
        user_phoneNumber: this.viewUser.user_phoneNumber,
        user_address: this.viewUser.user_address,
        user_birthDate: moment(new Date(this.viewUser.user_birthDate)).format(
          'YYYY-MM-DD'
        ),
        user_gender: this.viewUser.user_gender,
        user_status: this.viewUser.user_status,
        user_quantity_canceled: this.viewUser.user_quantity_canceled,
        user_role_name: role_name,
      });
    });
  }

  onSaveStatus() {
    this.user
      .updateStatusUser(
        this.viewProfileForm.get('user_email')?.value,
        this.viewProfileForm.get('user_status')?.value
      )
      .subscribe(
        (res) => {
          this.user.getAllUser().subscribe((res) => {
            this.lstData = res;
            if (this.searchData == '') {
              this.lstUser = this.lstData;
            } else {
              this.lstUser = this.lstData.filter((user: any) =>
                Object.values(user).some(
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
            title: 'Update status successfully',
            showConfirmButton: false,
            timer: 2000,
          });
        },
        (err) => {
          Swal.fire({
            title: 'Update status unsuccessful',
            text: 'Update status unsuccessful. Please try again.',
            icon: 'error',
          });
        }
      );
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
