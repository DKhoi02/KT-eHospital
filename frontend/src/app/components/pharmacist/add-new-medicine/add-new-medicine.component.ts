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
import { MedicineService } from 'src/app/services/medicine.service';
import { RoleService } from 'src/app/services/role.service';
import { RoomService } from 'src/app/services/room.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-new-medicine',
  templateUrl: './add-new-medicine.component.html',
  styleUrls: ['./add-new-medicine.component.css'],
})
export class AddNewMedicineComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  AddNewMedicineForm!: FormGroup;
  public roleName: string = '';
  public lstUser: any = [];
  public lstData: any = [];
  public viewUser: any = [];
  public searchData: string = '';
  public imgUser: string = '';
  lstRoles: any = [];
  public imgMedicine: string = '';
  fileToMedicine: any;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private sanitizer: DomSanitizer,
    private roomService: RoomService,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    this.AddNewMedicineForm = this.fb.group({
      medicine_name: ['', [Validators.required, Validators.maxLength(100)]],
      medicine_quantity: ['', [Validators.required, this.checkNumber()]],
      medicine_price: ['', [Validators.required, this.checkNumber()]],
      medicine_description: [
        '',
        [Validators.required, , Validators.maxLength(1000)],
      ],
      medicine_status: ['Available'],
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
    if (this.AddNewMedicineForm.valid) {
      enum Medicine_status {
        Available,
        Unavailable,
      }
      let medicine = {
        medicine_name:
          this.AddNewMedicineForm.get('medicine_name')?.value.trim(),
        medicine_quantity:
          this.AddNewMedicineForm.get('medicine_quantity')?.value,
        medicine_price: this.AddNewMedicineForm.get('medicine_price')?.value,
        medicine_image:
          'https://localhost:7072/MedicineImgs/notfound.png',
        medicine_date: new Date(),
        medicine_description: this.AddNewMedicineForm.get(
          'medicine_description'
        )?.value.trim(),
        medicine_status:
          this.AddNewMedicineForm.get('medicine_status')?.value == 'Available'
            ? Medicine_status.Available
            : Medicine_status.Unavailable,
      };
      this.medicineService.addNewMedicine(medicine).subscribe(
        (response: any) => {
          if (this.fileToMedicine !== undefined) {
            this.medicineService
              .uploadMedicineImage(this.fileToMedicine, response.medicine_id)
              .subscribe(
                (res) => {
                  this.AddNewMedicineForm.reset();
                  Swal.fire('Add New Medicine successfully', '', 'success');
                  this.router.navigate(['pharmacist-medicine']);
                },
                (err) => {
                  Swal.fire('Add New Medicine Failed', err.message, 'error');
                }
              );
          }
          Swal.fire('Add New Medicine successfully', '', 'success');
          this.router.navigate(['pharmacist-medicine']);
        },
        (error: any) => {
          Swal.fire('Add New Medicine Failed', error.message, 'error');
        }
      );
    } else {
      ValidateForm.validateAllFormFields(this.AddNewMedicineForm);
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

  handleFileMedicine(event: any) {
    this.fileToMedicine = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToMedicine);
    reader.onload = () => {
      this.imgMedicine = reader.result as string;
    };
  }
}
