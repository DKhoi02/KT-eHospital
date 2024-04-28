import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

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
    private router: Router
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
      console.log(this.lstBlogs);
    });
  }

  onView(id: number) {
    if (this.currentUser != undefined) {
      this.blogService.addCountBlog(this.currentUser, id).subscribe((res) => {
        this.router.navigate(['/view-blog', id]);
      });
    } else {
      this.router.navigate(['/view-blog', id]);
    }
  }
}
