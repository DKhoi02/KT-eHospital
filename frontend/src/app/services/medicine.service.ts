import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MedicineService {
  private baseUrl: string = 'https://localhost:7072/medicine/';

  constructor(private http: HttpClient) {}

  getAllMedicines() {
    return this.http.get(this.baseUrl);
  }

  addNewMedicine(medicine: any) {
    return this.http.post(this.baseUrl + 'add-new-medicine', medicine);
  }

  uploadMedicineImage(file: File, medicine_id: number) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(this.baseUrl + 'upload-img-medicine', formData, {
      params: { medicine_id },
    });
  }

  updateMedicine(medicine: any) {
    return this.http.post(this.baseUrl + 'update-medicine', medicine);
  }

  getMedicineByID(medicine_id: number) {
    return this.http.get(this.baseUrl + 'get-medicine-by-id', {
      params: { medicine_id },
    });
  }

  getAllMedicineByStatus() {
    return this.http.get(this.baseUrl + 'get-all-by-status');
  }
}
