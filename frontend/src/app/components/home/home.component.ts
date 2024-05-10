import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public currentUser!: string;
  public role!: string;
  public lstDoctors: any = [];
  public lstBlogs: any = [];

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private blogService: BlogService,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.userStore.getEmailFromStore().subscribe((val) => {
      const emailFromToken = this.auth.getEmailFromToken();
      this.currentUser = val || emailFromToken;
    });

    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });

    this.userService.getDoctorHome().subscribe((res) => {
      this.lstDoctors = res;
    });

    this.blogService.getBlogHome().subscribe((res) => {
      this.lstBlogs = res;
    });
  }

  doctorDetail(user_email:string){
    this.dataService.setDoctorDetail(user_email)
    this.router.navigate(['doctor-detail'])
  }

  onView(id: number) {
    this.dataService.setViewBlog(id.toString());
    if (this.currentUser != undefined) {
      this.blogService.addCountBlog(this.currentUser, id).subscribe((res) => {
        this.router.navigate(['/view-blog']);
      });
    } else {
      this.router.navigate(['/view-blog']);
    }
  }
}
