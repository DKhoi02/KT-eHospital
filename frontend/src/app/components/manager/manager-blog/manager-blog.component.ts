import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
import { DataService } from 'src/app/services/data.service';
import { MedicineService } from 'src/app/services/medicine.service';
import { RoleService } from 'src/app/services/role.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-blog',
  templateUrl: './manager-blog.component.html',
  styleUrls: ['./manager-blog.component.css'],
})
export class ManagerBlogComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public UpdateBlogForm!: FormGroup;
  public roleName: string = '';
  public lstBlog: any = [];
  public lstData: any = [];
  public viewBlog: any = [];
  public searchData: string = '';
  public img: string = '';
  fileToImg!: File;
  medicine_id: number = 0;
  medicine_date: any;
  medicine_OldImg: string = '';
  idBlog: number = 0;
  public fullName: string = '';

  pageSize = 5;
  currentPage = 1;

  @ViewChild('tableRef') tableRef!: ElementRef;
  fileToContent: any;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private sanitizer: DomSanitizer,
    private medicineService: MedicineService,
    private blogService: BlogService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.UpdateBlogForm = this.fb.group({
      blog_title: ['', [Validators.required, Validators.maxLength(100)]],
      blog_demo: ['', [Validators.required, Validators.maxLength(100)]],
      blog_status: ['Public'],
    });

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
          this.fullName = this.userModel.user_fullName;
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

    this.blogService.getAllBlog().subscribe((res) => {
      this.lstData = res;
      this.convertToString();
      this.lstBlog = this.lstData;
    });
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

  checkNumber(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      const value: string = control.value;
      if (!/^\d+$/.test(value)) {
        return { isNotNumber: true };
      }
      return null;
    };
  }

  onChageSearch(event: any) {
    this.searchData = event.target.value;
    if (this.searchData == '') {
      this.lstBlog = this.lstData;
    } else {
      this.lstBlog = this.lstData.filter((medicine: any) =>
        Object.values(medicine).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(this.searchData)
        )
      );
      this.highlightKeyword(this.searchData);
    }
  }

  highlightKeyword(text: string): SafeHtml {
    if (!this.searchData.trim()) {
      return text;
    }
    const regex = new RegExp(this.searchData, 'gi');
    const highlightedText = text.replace(
      regex,
      (match) =>
        `<span style="background-color: yellow !important;">${match}</span>`
    );
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  managerViewBlog(id: number) {
    this.dataService.setManagerViewBlog(id.toString());
    this.router.navigate(['manager-view-blog']);
  }

  onSignOut() {
    this.auth.signOut();
  }

  onView(id: number) {
    this.blogService.getBlogByID(id).subscribe((res) => {
      this.viewBlog = res;
      console.log(this.viewBlog);
      this.img = this.viewBlog.img;
      this.idBlog = this.viewBlog.id;
      this.UpdateBlogForm.patchValue({
        blog_title: this.viewBlog.title,
        blog_demo: this.viewBlog.demo,
        blog_status: this.viewBlog.status,
      });
    });
  }

  onSave() {
    Swal.fire({
      html: `
    <div id="background" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999; background-color: rgba(0, 0, 0, 0.5);"></div>
    <img id="image" src="assets/img/loading.gif" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; display: none;">
  `,
      width: 0,
      showConfirmButton: false,
    });

    setTimeout(() => {
      const image = document.getElementById('image');
      if (image) {
        image.style.display = 'block';
      }
    }, 500);
    const formData: FormData = new FormData();

    if (this.fileToContent != undefined) {
      const contentBlob = new Blob([this.fileToContent], {
        type: this.fileToContent.type,
      });
      formData.append('uploadContent', contentBlob, this.fileToContent.name);
    }
    if (this.fileToImg != undefined) {
      const imgBlob = new Blob([this.fileToImg], {
        type: this.fileToImg.type,
      });
      formData.append('uploadImg', imgBlob, this.fileToImg.name);
    }

    formData.append('id', this.idBlog.toString());
    formData.append('title', this.UpdateBlogForm.get('blog_title')?.value);
    formData.append('demo', this.UpdateBlogForm.get('blog_demo')?.value);
    formData.append('status', this.UpdateBlogForm.get('blog_status')?.value);

    this.blogService.updateBlog(formData).subscribe(
      (res) => {
        Swal.close();
        this.blogService.getAllBlog().subscribe((res) => {
          this.lstData = res;
          this.convertToString();
          this.lstBlog = this.lstData;
        });
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Update blog successfully',
          showConfirmButton: false,
          timer: 2000,
        });
      },
      (err) => {
        Swal.close();
        Swal.fire({
          title: 'Update blog unsuccessful',
          text: err.message,
          icon: 'error',
        });
      }
    );
  }

  handleFileMedicine(event: any) {
    this.fileToImg = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToImg);
    reader.onload = () => {
      this.img = reader.result as string;
    };
  }

  handleFileContent(event: any) {
    this.fileToContent = event.target.files[0];
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
