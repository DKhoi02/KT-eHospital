import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
import { DataService } from 'src/app/services/data.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-blog-search',
  templateUrl: './blog-search.component.html',
  styleUrls: ['./blog-search.component.css'],
})
export class BlogSearchComponent implements OnInit {
  public currentUser!: string;
  public role!: string;
  public lstBlogs: any = [];
  public lstData: any = [];
  keySearch: string = '';

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

    this.blogService.getBlogSearch().subscribe((res) => {
      this.lstData = res;
      this.convertToString();
      this.lstBlogs = this.lstData;
    });
  }

  onChange(even: any) {
    this.keySearch = even.target.value;
    if (this.keySearch.length > 0) {
      this.lstBlogs = this.lstData.filter((user: any) =>
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
}
