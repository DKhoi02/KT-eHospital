import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { MedicineService } from 'src/app/services/medicine.service';
import { RoleService } from 'src/app/services/role.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pharmacist-medicine',
  templateUrl: './pharmacist-medicine.component.html',
  styleUrls: ['./pharmacist-medicine.component.css'],
})
export class PharmacistMedicineComponent implements OnInit {
  public currentUser!: string;
  public imgUrl: string = 'assets/img/image_error.jpg';
  public userModel!: UserModel;
  public viewMedicineForm!: FormGroup;
  public roleName: string = '';
  public lstMedicine: any = [];
  public lstData: any = [];
  public viewMedicine: any = [];
  public searchData: string = '';
  public imgMedicine: string = '';
  fileToMedicine!: File;
  medicine_id: number = 0;
  medicine_date: any;
  medicine_OldImg: string = '';

  pageSize = 5;
  currentPage = 1;

  @ViewChild('tableRef') tableRef!: ElementRef;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private user: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private sanitizer: DomSanitizer,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    this.viewMedicineForm = this.fb.group({
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

    this.medicineService.getAllMedicines().subscribe((res) => {
      this.lstData = res;
      this.convertToString();
      this.lstMedicine = this.lstData;
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
      this.lstMedicine = this.lstData;
    } else {
      this.lstMedicine = this.lstData.filter((medicine: any) =>
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

  onSignOut() {
    this.auth.signOut();
  }

  onView(medicine_id: number) {
    this.medicineService.getMedicineByID(medicine_id).subscribe((res) => {
      this.viewMedicine = res;
      this.imgMedicine = this.viewMedicine.medicine_image;
      this.medicine_id = this.viewMedicine.medicine_id;
      this.medicine_date = this.viewMedicine.medicine_date;
      this.medicine_OldImg = this.viewMedicine.medicine_image;
      this.viewMedicineForm.patchValue({
        medicine_name: this.viewMedicine.medicine_name,
        medicine_quantity: this.viewMedicine.medicine_quantity,
        medicine_price: this.viewMedicine.medicine_price,
        medicine_description: this.viewMedicine.medicine_description,
        medicine_status: this.viewMedicine.medicine_status,
      });
    });
  }

  onSave() {
    enum Medicine_status {
      Available,
      Unavailable,
    }
    let medicine = {
      medicine_id: this.medicine_id,
      medicine_name: this.viewMedicineForm.get('medicine_name')?.value.trim(),
      medicine_quantity: this.viewMedicineForm.get('medicine_quantity')?.value,
      medicine_price: this.viewMedicineForm.get('medicine_price')?.value,
      medicine_image: this.medicine_OldImg,
      medicine_date: new Date(),
      medicine_description: this.viewMedicineForm
        .get('medicine_description')
        ?.value.trim(),
      medicine_status:
        this.viewMedicineForm.get('medicine_status')?.value == 'Available'
          ? Medicine_status.Available
          : Medicine_status.Unavailable,
    };
    this.medicineService.updateMedicine(medicine).subscribe(
      (response: any) => {
        if (this.fileToMedicine !== undefined) {
          this.medicineService
            .uploadMedicineImage(this.fileToMedicine, this.medicine_id)
            .subscribe(
              (res) => {
                this.fileToMedicine === undefined;
                this.medicineService.getAllMedicines().subscribe((res) => {
                  this.lstData = res;
                  this.convertToString();
                  if (this.searchData == '') {
                    this.lstMedicine = this.lstData;
                  } else {
                    this.lstMedicine = this.lstData.filter((medicine: any) =>
                      Object.values(medicine).some(
                        (value) =>
                          typeof value === 'string' &&
                          value.toLowerCase().includes(this.searchData)
                      )
                    );
                    this.highlightKeyword(this.searchData);
                  }
                });
                Swal.fire('Update Medicine successfully', '', 'success');
              },
              (err) => {
                Swal.fire('Update Medicine Failed', err.message, 'error');
              }
            );
        } else {
          this.medicineService.getAllMedicines().subscribe((res) => {
            this.lstData = res;
            this.convertToString();
            if (this.searchData == '') {
              this.lstMedicine = this.lstData;
            } else {
              this.lstMedicine = this.lstData.filter((medicine: any) =>
                Object.values(medicine).some(
                  (value) =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(this.searchData)
                )
              );
              this.highlightKeyword(this.searchData);
            }
          });
          Swal.fire('Update Medicine successfully', '', 'success');
        }
      },
      (error: any) => {
        Swal.fire('Update Medicine Failed', error.message, 'error');
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
}
