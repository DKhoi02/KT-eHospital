import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-room',
  templateUrl: './admin-room.component.html',
  styleUrls: ['./admin-room.component.css'],
})
export class AdminRoomComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public viewRoomForm!: FormGroup;
  public roleName: string = '';
  public lstRoom: any = [];
  public lstData: any = [];
  public viewRoom: any = [];
  public searchData: string = '';

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
    private sanitizer: DomSanitizer,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.viewRoomForm = this.fb.group({
      room_id: [{ value: '', disabled: true }],
      room_name: [''],
      room_status: [''],
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

    this.roomService.getRooms().subscribe((res) => {
      this.lstData = res;
      this.lstRoom = this.lstData;
    });
  }

  onChageSearch(event: any) {
    this.searchData = event.target.value;
    if (this.searchData == '') {
      this.lstRoom = this.lstData;
    } else {
      this.lstRoom = this.lstData.filter((user: any) =>
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

  onView(id: number) {
    this.roomService.getRoomByID(id).subscribe((res) => {
      this.viewRoom = res;
      console.log(this.viewRoom);
      this.viewRoomForm.patchValue({
        room_id: this.viewRoom.room_id,
        room_name: this.viewRoom.room_name,
        room_status: this.viewRoom.room_status,
      });
    });
  }

  onSaveStatus() {
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
      .updateStatusRoom(
        this.viewRoomForm.get('room_id')?.value,
        this.viewRoomForm.get('room_name')?.value,
        this.viewRoomForm.get('room_status')?.value
      )
      .subscribe(
        (res) => {
          Swal.close();
          this.roomService.getRooms().subscribe((res) => {
            this.lstData = res;
            if (this.searchData == '') {
              this.lstRoom = this.lstData;
            } else {
              this.lstRoom = this.lstData.filter((room: any) =>
                Object.values(room).some(
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
            title: 'Update room successfully',
            showConfirmButton: false,
            timer: 2000,
          });
        },
        (err) => {
          Swal.close();
          Swal.fire({
            title: 'Update room unsuccessful',
            text: 'Update room unsuccessful. Please try again.',
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
