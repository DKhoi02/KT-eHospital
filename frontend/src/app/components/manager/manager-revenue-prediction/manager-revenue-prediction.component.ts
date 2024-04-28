import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { MachineLearningService } from 'src/app/services/machine-learning.service';
import { StatisticService } from 'src/app/services/statistic.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-revenue-prediction',
  templateUrl: './manager-revenue-prediction.component.html',
  styleUrls: ['./manager-revenue-prediction.component.css'],
})
export class ManagerRevenuePredictionComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public roleName: string = '';

  public time: number = 0;
  public predictImg!: string;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private user: UserService,
    private statisticService: StatisticService,
    private machineLearningService: MachineLearningService
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
  }

  onStatistic() {
    if (this.time > 0) {
      this.statisticService.getRevenuePrediction().subscribe((res: any) => {
        let revenue = res.revenue.join(',');

        this.machineLearningService
          .revenuePrediction(
            res.startDate,
            res.endDate,
            this.time,
            revenue
          )
          .subscribe((res: any) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.predictImg = reader.result as string;
            };
            reader.readAsDataURL(res);
          });
      });
    } else {
      Swal.fire({
        title: 'Revenue prediction unsuccessful',
        text: 'Please choose time',
        icon: 'error',
      });
    }
  }

  onSignOut() {
    this.auth.signOut();
  }

  onChooseTime(even: any) {
    this.time = parseInt(even.target.value);
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