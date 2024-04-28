import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  baseUrl: string = 'https://localhost:7072/prescription/';

  constructor(private http: HttpClient) {}

  addPrescription(
    email: string,
    appointment_id: number,
    medicine_name: string,
    medicine_total: number,
    number_perday: number,
    pill: number
  ) {
    return this.http.post(
      this.baseUrl + 'add-prescription',
      {},
      {
        params: {
          email,
          appointment_id,
          medicine_name,
          medicine_total,
          number_perday,
          pill,
        },
      }
    );
  }

  getAllAppointmentByID(id: number){
    return this.http.get(this.baseUrl + 'get-prescription-by-id', {params: {id}});
  }

  deletePrescription(id: number){
    return this.http.delete(this.baseUrl + 'delete-prescripton', {params: {id}});
  }
}
