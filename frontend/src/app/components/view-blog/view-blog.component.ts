import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
import { DataService } from 'src/app/services/data.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-view-blog',
  templateUrl: './view-blog.component.html',
  styleUrls: ['./view-blog.component.css'],
})
export class ViewBlogComponent implements OnInit {
  public currentUser!: string;
  blogID: number = 0;
  title: string = '';
  img: string = '';
  content: string = '';
  lstRecomment: any = [];

  constructor(
    private blogService: BlogService,
    private activatedRouter: ActivatedRoute,
    private userService: UserService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.blogID = +this.dataService.getViewBlog();

    this.userStore.getEmailFromStore().subscribe((val) => {
      const emailFromToken = this.auth.getEmailFromToken();
      this.currentUser = val || emailFromToken;
    });

    this.blogService.getRecomment(this.blogID).subscribe((res: any) => {
      this.lstRecomment = res;
    });

    this.blogService.getBlogByID(this.blogID).subscribe((res: any) => {
      this.title = res.title;
      this.img = res.img;
      this.content = res.content.result;
    });
  }

  onView(id: number) {
    this.dataService.setViewBlog(id.toString());
    if (this.currentUser != undefined) {
      this.blogService.addCountBlog(this.currentUser, id).subscribe((res) => {
        window.location.reload();
        this.router.navigate(['/view-blog']);
      });
    } else {
      window.location.reload();
      this.router.navigate(['/view-blog']);
    }
  }
}
