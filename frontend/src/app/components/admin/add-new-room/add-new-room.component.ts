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
import { RoomService } from 'src/app/services/room.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-new-room',
  templateUrl: './add-new-room.component.html',
  styleUrls: ['./add-new-room.component.css'],
})
export class AddNewRoomComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  AddNewRoomForm!: FormGroup;
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
    private sanitizer: DomSanitizer,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.AddNewRoomForm = this.fb.group({
      room_name: ['', [Validators.required, Validators.maxLength(255)]],
      room_status: ['Available'],
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
  }

  onSignOut() {
    this.auth.signOut();
  }

  onAddNewRoom() {
    if (this.AddNewRoomForm.valid) {
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
      this.roomService
        .addNewRoom(
          this.AddNewRoomForm.get('room_name')?.value.trim(),
          this.AddNewRoomForm.get('room_status')?.value.trim()
        )
        .subscribe(
          (response) => {
            Swal.close();
            this.AddNewRoomForm.reset();
            Swal.fire('Add New Room successfully', '', 'success');
            this.router.navigate(['admin-room']);
          },
          (error: any) => {
            Swal.close();
            Swal.fire('Add New Room Failed', error.message, 'error');
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.AddNewRoomForm);
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
