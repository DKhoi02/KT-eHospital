import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-doctor-search',
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css'],
})
export class DoctorSearchComponent implements OnInit {
  lstData: any = [];
  lstDoctors: any = [];
  keySearch = '';

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getAllEmployee().subscribe((res) => {
      this.lstData = res;
      this.convertToString();
      this.lstDoctors = this.lstData;
    });
  }

  onChange(even: any) {
    this.keySearch = even.target.value;
    if (this.keySearch.length > 0) {
      this.lstDoctors = this.lstData.filter((user: any) =>
        Object.values(user).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(this.keySearch)
        )
      );
    } else {
      this.ngOnInit();
    }
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

  doctorDetail(user_email: string) {
    this.dataService.setDoctorDetail(user_email);
    this.router.navigate(['doctor-detail']);
  }
}
