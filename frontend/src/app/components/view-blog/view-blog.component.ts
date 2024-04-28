import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRouter.params.subscribe((params: any) => {
      this.blogID = +params['id'];
    });

  
    this.userStore.getEmailFromStore().subscribe((val) => {
      const emailFromToken = this.auth.getEmailFromToken();
      this.currentUser = val || emailFromToken;
    });

    console.log(this.blogID)

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
    if (this.currentUser != undefined) {
      this.blogService.addCountBlog(this.currentUser, id).subscribe((res) => {
        this.router.navigate(['/view-blog', id]);
      });
    } else {
      this.router.navigate(['/view-blog', id]);
    }
  }
}
