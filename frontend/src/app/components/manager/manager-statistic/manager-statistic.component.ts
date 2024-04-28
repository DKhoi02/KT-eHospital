import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'node_modules/chart.js';
import { StatisticService } from 'src/app/services/statistic.service';
Chart.register(...registerables);

@Component({
  selector: 'app-manager-statistic',
  templateUrl: './manager-statistic.component.html',
  styleUrls: ['./manager-statistic.component.css'],
})
export class ManagerStatisticComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';

  //Chart
  radarChart: any;
  public total_revenue: string = '';
  public total_user: string = '';
  public total_appointment: string = '';
  public total_blog:string = '';

  public fromDate: string = '';
  public toDate: string = '';

  total: number = 0;
  lstStatus: string[] = [];
  lstAppointment: string[] = [];
  lstData: any = [];

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private user: UserService,
    private statisticService: StatisticService
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

    this.statisticService.getTotalStatistic().subscribe((res: any) => {
      this.total_revenue = res.total_revenue;
      this.total_user = res.total_user;
      this.total_appointment = res.total_appointment;
      this.total_blog = res.total_blog;
    });
  }

  RadarChart() {
    const data = {
      labels: this.lstStatus,
      datasets: [
        {
          label:
            'Total Appointment with status from ' +
            this.fromDate +
            ' to ' +
            this.toDate,
          data: this.lstAppointment,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            '#71b657',
            '#e3632d',
            '#6c757d',
          ],
          hoverOffset: 4,
        },
      ],
    };

    const dataTotal = {
      labels: ['Total Revenue'],
      datasets: [
        {
          label: 'Total Revenue from ' + this.fromDate + ' to ' + this.toDate,
          data: [this.total],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            '#71b657',
            '#e3632d',
            '#6c757d',
          ],
          hoverOffset: 4,
        },
      ],
    };

    this.radarChart = new Chart('radarChart', {
      type: 'pie',
      data: dataTotal,

      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    this.radarChart = new Chart('radarChart1', {
      type: 'pie',
      data: data,

      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  onStatistic() {
    if (this.fromDate.length > 0 && this.toDate.length > 0) {
      this.statisticService
        .getDateStatistic(this.fromDate, this.toDate)
        .subscribe(
          (res: any) => {
            console.log(res);
            this.total = res.total;
            this.lstData = res.data;
            this.lstData.forEach(
              (item: { status: any; quantity_appointment: any }) => {
                this.lstStatus.push(item.status);
                this.lstAppointment.push(item.quantity_appointment);
              }
            );
            this.RadarChart();
          },
          (err) => {
            Swal.fire({
              title: 'Statistic unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
    } else {
      Swal.fire({
        title: 'Statistic unsuccessful',
        text: 'Please enter full from and to date',
        icon: 'error',
      });
    }
  }

  onSignOut() {
    this.auth.signOut();
  }

  onChangeFromDate(even: any) {
    this.fromDate = even.target.value;
  }

  onChangeToDate(even: any) {
    this.toDate = even.target.value;
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
