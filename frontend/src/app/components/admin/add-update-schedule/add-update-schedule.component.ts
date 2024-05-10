import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-update-schedule',
  templateUrl: './add-update-schedule.component.html',
  styleUrls: ['./add-update-schedule.component.css'],
})
export class AddUpdateScheduleComponent implements OnInit {
  @ViewChild('tableRef') tableRef!: ElementRef;

  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';
  public scheduleForm!: FormGroup;

  isShow: string = '';
  chooseDate: string = '';

  lstYear: any = [];
  getCurrentYear: number = 0;

  lstDayOfWeeks: any = [];
  lstWeekOfYear: any = [];
  currentWeek: any;

  lstDoctor: any = [];
  lstRoom: any = [];

  lstData: any = [];
  lstSchedule: any = [];

  public searchData: string = '';

  checkDate: boolean = true;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private roomService: RoomService,
    private scheduleService: ScheduleService,
    private activatedRouter: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.scheduleForm = this.fb.group({
      schedule_doctor: ['', [Validators.required, this.checkScheduleDoctor()]],
      schedule_room: ['', [Validators.required, this.checkScheduleRoom()]],
    });

    this.chooseDate = this.dataService.getAdminAddUpdateSchedule();

    this.checkDate =
      new Date(this.chooseDate).setHours(0, 0, 0, 0) >=
      new Date().setHours(0, 0, 0, 0)
        ? true
        : false;

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

    this.user.getAllDoctor().subscribe((res) => {
      this.lstDoctor = res;
    });

    this.roomService.getAllRoom().subscribe((res) => {
      this.lstRoom = res;
    });

    this.scheduleService.getAllSchedule(this.chooseDate).subscribe((res) => {
      this.lstData = res;
      this.lstSchedule = this.lstData;
    });
  }

  onChageSearch(event: any) {
    this.searchData = event.target.value;
    if (this.searchData == '') {
      this.lstSchedule = this.lstData;
    } else {
      this.lstSchedule = this.lstData.filter((user: any) =>
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

  onDelete(id: number, email: string, room: string) {
    Swal.fire({
      title: 'Are you sure delete?',
      text:
        'You want to delete the schedule is: ' +
        email +
        ' with Room is: ' +
        room,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
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
        this.scheduleService.deleteSchedule(id).subscribe(
          (res) => {
            Swal.close();
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Deleted Schedule successfully',
              showConfirmButton: false,
              timer: 2000,
            });
            this.scheduleService
              .getAllSchedule(this.chooseDate)
              .subscribe((res) => {
                this.lstData = res;
                this.lstSchedule = this.lstData;
              });
          },
          (err) => {
            Swal.close();
            Swal.fire({
              title: 'Delete Schedule unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
      }
    });
  }

  onUpdate(email: string, room: string) {
    this.scheduleForm.patchValue({
      schedule_doctor: email,
      schedule_room: room,
    });
  }

  onSave() {
    if (this.scheduleForm.valid) {
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
      this.scheduleService
        .addSchedule(
          this.scheduleForm.get('schedule_doctor')?.value,
          this.scheduleForm.get('schedule_room')?.value,
          this.chooseDate
        )
        .subscribe(
          (res) => {
            Swal.close();
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Save Schedule successfully',
              showConfirmButton: false,
              timer: 2000,
            });
            this.scheduleForm.reset();
            this.scheduleService
              .getAllSchedule(this.chooseDate)
              .subscribe((res) => {
                this.lstData = res;
                this.lstSchedule = this.lstData;
              });
          },
          (err) => {
            Swal.close();
            Swal.fire({
              title: 'Save Schedule unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
    } else {
      ValidateForm.validateAllFormFields(this.scheduleForm);
    }
  }

  checkScheduleRoom(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      if (
        !this.lstRoom.find(
          (room: { room_name: any }) => room.room_name == control.value
        )
      ) {
        return { isWrongRoom: true };
      }
      return null;
    };
  }

  checkScheduleDoctor(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      if (
        !this.lstDoctor.find(
          (doctor: { user_email: any }) => doctor.user_email == control.value
        )
      ) {
        return { isWrongDoctor: true };
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
}
