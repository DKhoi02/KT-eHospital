import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css'],
})
export class DoctorDetailComponent implements OnInit {
  public emailDoctor: string = '';
  public imgURL: string = '';
  public profile: string = '';

  constructor(
    private activatedRouter: ActivatedRoute,
    private userService: UserService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.activatedRouter.params.subscribe((params: any) => {
      this.emailDoctor = params['email'];
    });

    this.userService.getDoctorDetail(this.emailDoctor).subscribe((res: any) => {
      this.imgURL = res.img;
      this.profile = res.profile.result;
    });
  }
}
