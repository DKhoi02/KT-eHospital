import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  baseUrl: string = 'https://localhost:7072/appointment/';

  constructor(private http: HttpClient) {}

  bookAppointment(appointment: string, user_id: string) {
    const formData = new FormData();
    formData.append('appointment_time', appointment);
    formData.append('user_id', user_id);
    return this.http.post(this.baseUrl + 'book-appointment', formData);
  }

  getQuantityBooked(appointment_time: string) {
    return this.http.get<number>(this.baseUrl + 'get-quantity-booked', {
      params: { appointment_time },
    });
  }

  getAllMedicalByDoctor(email: string) {
    return this.http.get(this.baseUrl + 'get-all-medical-by-doctor', {
      params: { email },
    });
  }

  getAllMedicalByPharmacist() {
    return this.http.get(this.baseUrl + 'get-all-medical-by-pharmacist');
  }

  getUserByAppointment(appointment_id: number) {
    return this.http.get(this.baseUrl + 'get-user-by-appointment', {
      params: { appointment_id },
    });
  }

  addSymptom(id: number, symptom: string, email: string) {
    return this.http.post(
      this.baseUrl + 'add-symptom',
      {},
      { params: { id, symptom, email } }
    );
  }

  confirmAppointment(id: number) {
    return this.http.post(
      this.baseUrl + 'confirm-appointment',
      {},
      { params: { id } }
    );
  }

  getHistoryAppointmentByDoctor(id: number) {
    return this.http.get(this.baseUrl + 'get-history-appointment-by-doctor', {
      params: { id },
    });
  }

  confirmAppointmentByPharmacist(id: number, email: string) {
    return this.http.post(
      this.baseUrl + 'confirm-appointment-by-pharmacist',
      {},
      { params: { id, email } }
    );
  }

  getAllAppointmentByManager() {
    return this.http.get(this.baseUrl + 'get-all-appointment-by-manager');
  }

  getAllAppointmentByPatient(email:string) {
    return this.http.get(this.baseUrl + 'get-all-appointment-by-patient', {params: {email}});
  }

  resetStatusAppointment(id: number) {
    return this.http.post(
      this.baseUrl + 'reset-status-appointment',
      {},
      { params: { id } }
    );
  }

  cancelAppointment(id: number) {
    return this.http.post(
      this.baseUrl + 'cancel-status-appointment',
      {},
      { params: { id } }
    );
  }

  changeDoctor(id: number, email: string, room_name: string, time: string) {
    return this.http.post(
      this.baseUrl + 'change-doctor',
      {},
      { params: { id, email, room_name, time } }
    );
  }
}
