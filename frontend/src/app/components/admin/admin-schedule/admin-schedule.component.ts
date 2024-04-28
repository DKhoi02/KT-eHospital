import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import { CalendarOptions } from '@fullcalendar/core';
import Swal from 'sweetalert2';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { RoomService } from 'src/app/services/room.service';
import ValidateForm from 'src/app/helpers/validateForms';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-admin-schedule',
  templateUrl: './admin-schedule.component.html',
  styleUrls: ['./admin-schedule.component.css'],
})
export class AdminScheduleComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';
  public scheduleForm!: FormGroup;

  chooseDate: string = '';

  lstYear: any = [];
  getCurrentYear: number = 0;

  lstDayOfWeeks: any = [];
  lstWeekOfYear: any = [];
  currentWeek: any;

  lstDoctor: any = [];
  lstRoom: any = [];
  lstSchedule: any = [];

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private roomService: RoomService,
    private scheduleService: ScheduleService
  ) {}

  // data: any = [
  //   {
  //     title: 'Room: ' + 'P02' + '<br>' + 'Dang Nguyen Dang Khoi',
  //     date: '2024-04-05',
  //     color: '#ffcccc',
  //   },
  // ];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    // events: this.data,
    // eventContent: this.customEventContent.bind(this),
    dayCellDidMount: this.handleDayCellMount.bind(this),
    dateClick: this.handleDateClick.bind(this),
  };

  // customEventContent(info: any, createElement: any) {
  //   const container = document.createElement('div');
  //   container.innerHTML = info.event.title;
  //   return { domNodes: [container] };
  // }

  handleDateClick(arg: any) {
    this.chooseDate = arg.dateStr;
    this.router.navigate(['admin-add-update-schedule', this.chooseDate]);
  }

  handleDayCellMount(info: any) {
    const cell = info.el;
    const date = info.date;

    this.scheduleService.getSchedule().subscribe((res) => {
      this.lstSchedule = res;

      this.lstSchedule.forEach(
        (element: { schedule_date: string | number | Date }) => {
          const dateSchedule = moment(new Date(element.schedule_date)).format(
            'YYYY-MM-DD'
          );

          const dateCompare = moment(new Date(date)).format(
            'YYYY-MM-DD'
          );

          if (dateCompare === dateSchedule) {
            cell.style.backgroundColor = '#28a745';
          }
        }
      );
    });
  }

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
