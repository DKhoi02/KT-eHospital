import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private baseUrl: string = 'https://localhost:7072/schedule/';

  constructor(private http: HttpClient) {}

  addSchedule(email: string, room: string, date: string) {
    return this.http.post(
      this.baseUrl + 'add-schedule',
      {},
      { params: { email, room, date } }
    );
  }

  getAllSchedule(date: string) {
    return this.http.get(this.baseUrl + 'get-all-schedule', {
      params: { date },
    });
  }

  getSchedule() {
    return this.http.get(this.baseUrl);
  }

  deleteSchedule(id: number) {
    return this.http.delete(this.baseUrl + 'delete-schedule', {
      params: { id },
    });
  }

  getDoctorChangeAppointment(time:string){
    return this.http.get(this.baseUrl + 'get-doctor-change-appointment', {params: {time}});
  }

  getScheduleDoctor(email:string){
    return this.http.get(this.baseUrl+'get-schedule-doctor', {params: {email}})
  }
}
