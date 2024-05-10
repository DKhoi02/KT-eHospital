import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateForms';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { BlogService } from 'src/app/services/blog.service';
import { MedicineService } from 'src/app/services/medicine.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-new-blog',
  templateUrl: './add-new-blog.component.html',
  styleUrls: ['./add-new-blog.component.css'],
})
export class AddNewBlogComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  AddNewBlogForm!: FormGroup;
  public roleName: string = '';
  public lstUser: any = [];
  public lstData: any = [];
  public viewUser: any = [];
  public searchData: string = '';
  public imgUser: string = '';
  lstRoles: any = [];
  public imgMedicine: string = '';
  fileToImg: any;
  fileToImgs: any;
  fileToContent: any;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private sanitizer: DomSanitizer,
    private roomService: RoomService,
    private medicineService: MedicineService,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.AddNewBlogForm = this.fb.group({
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

  onSignOut() {
    this.auth.signOut();
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

  onAddNewMedicine() {
    if (this.AddNewBlogForm.valid) {
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
      if (this.fileToContent != undefined && this.fileToImg != undefined) {
        const contentBlob = new Blob([this.fileToContent], {
          type: this.fileToContent.type,
        });
        const imgBlob = new Blob([this.fileToImg], {
          type: this.fileToImg.type,
        });
        const formData: FormData = new FormData();
        formData.append('uploadContent', contentBlob, this.fileToContent.name);
        formData.append('title', this.AddNewBlogForm.get('blog_title')?.value);
        formData.append('demo', this.AddNewBlogForm.get('blog_demo')?.value);
        formData.append(
          'status',
          this.AddNewBlogForm.get('blog_status')?.value
        );
        formData.append('uploadImg', imgBlob, this.fileToImg.name);

        this.blogService.addNewBlog(formData).subscribe(
          (res) => {
            Swal.close();
            this.AddNewBlogForm.reset();
            this.router.navigate(['manager-blog']);
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Add new blog successfully',
              showConfirmButton: false,
              timer: 2000,
            });
          },
          (err) => {
            Swal.close();
            Swal.fire({
              title: 'Add new blog unsuccessful',
              text: err.message,
              icon: 'error',
            });
          }
        );
      } else {
        Swal.close();
        Swal.fire({
          title: 'Add new blog unsuccessful',
          text: 'Please enter blog content and blog image',
          icon: 'error',
        });
      }
    } else {
      ValidateForm.validateAllFormFields(this.AddNewBlogForm);
    }
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

  handleFileMedicine(event: any) {
    this.fileToImg = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToImg);
    reader.onload = () => {
      this.fileToImgs = reader.result as string;
    };
  }

  handleFileContent(event: any) {
    this.fileToContent = event.target.files[0];
  }
}
