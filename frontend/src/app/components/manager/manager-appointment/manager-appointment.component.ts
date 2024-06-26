import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { RoleService } from 'src/app/services/role.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-appointment',
  templateUrl: './manager-appointment.component.html',
  styleUrls: ['./manager-appointment.component.css'],
})
export class ManagerAppointmentComponent implements OnInit {
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
  public fullName: string = '';

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
    private appointmentService: AppointmentService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
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
          this.fullName = this.userModel.user_fullName;
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

    this.appointmentService
      .getAllAppointmentByManager()
      .subscribe((res: any) => {
        Swal.close();
        this.lstData = res.reverse();
        this.convertToString();
        this.lstUser = this.lstData;
      });
  }

  convertToString() {
    this.lstData.forEach((item: any) => {
      for (const prop in item) {
        if (item == null) {
          continue;
        }
        if (item.hasOwnProperty(prop)) {
          if (item[prop] == null) {
            continue;
          }
          if (typeof item[prop] !== 'string') {
            item[prop] = item[prop].toString();
          }
        }
      }
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

  onResetStatus(id: number) {
    Swal.fire({
      title: 'Are you sure reset appointment?',
      text: '',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.resetStatusAppointment(id).subscribe(
          (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Reset appointment successfully',
              showConfirmButton: false,
              timer: 2000,
            });
            this.appointmentService
              .getAllAppointmentByManager()
              .subscribe((res: any) => {
                this.lstData = res.reverse();
                this.convertToString();
                if (this.searchData == '') {
                  this.lstUser = this.lstData;
                } else {
                  this.lstUser = this.lstData
                    .reverse()
                    .filter((medicine: any) =>
                      Object.values(medicine).some(
                        (value) =>
                          typeof value === 'string' &&
                          value.toLowerCase().includes(this.searchData)
                      )
                    );
                  this.highlightKeyword(this.searchData);
                }
              });
          },
          (err) => {
            Swal.fire({
              title: 'Reset appointment unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
      }
    });
  }

  onCancel(id: number) {
    Swal.fire({
      title: 'Are you sure cancel appointment?',
      text: '',
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.cancelAppointment(id).subscribe(
          (res) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cancel appointment successfully',
              showConfirmButton: false,
              timer: 2000,
            });
            this.appointmentService
              .getAllAppointmentByManager()
              .subscribe((res: any) => {
                this.lstData = res.reverse();
                this.convertToString();
                if (this.searchData == '') {
                  this.lstUser = this.lstData;
                } else {
                  this.lstUser = this.lstData
                    .reverse()
                    .filter((medicine: any) =>
                      Object.values(medicine).some(
                        (value) =>
                          typeof value === 'string' &&
                          value.toLowerCase().includes(this.searchData)
                      )
                    );
                  this.highlightKeyword(this.searchData);
                }
              });
          },
          (err) => {
            Swal.fire({
              title: 'Cancel appointment unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
      }
    });
  }

  managerChangeAppointment(id: number) {
    this.dataService.setManagerChangeAppointment(id.toString());
    this.router.navigate(['manager-change-appointment']);
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
