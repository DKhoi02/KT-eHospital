import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl: string = 'https://localhost:7072/user/';

  constructor(private http: HttpClient) {}

  getCurrentUser(email: string) {
    return this.http.get(this.baseUrl + 'get-current-user', {
      params: { email },
    });
  }

  updateProfile(userObj: any) {
    return this.http.post<any>(this.baseUrl + 'update-profile', userObj);
  }

  updateImage(file: File, email: string) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(this.baseUrl + 'update-image', formData, {
      params: { email },
    });
  }

  getAllUser() {
    return this.http.get<any>(this.baseUrl);
  }

  updateStatusUser(email: string, status: string) {
    return this.http.post<any>(
      this.baseUrl + 'update-status-user',
      {},
      { params: { email, status } }
    );
  }

  getAllDoctor() {
    return this.http.get(this.baseUrl + 'get-all-doctor');
  }

  getDoctorHome() {
    return this.http.get(this.baseUrl + 'get-doctor-home');
  }

  uploadFileProfile(formData:any, email:string){
     return this.http.post<any>(this.baseUrl + 'upload-file-profile', formData, {params: {email}});
  }

  getDoctorDetail(email:string){
    return this.http.get(this.baseUrl+'get-doctor-detail', {params: {email}})
  }

  getAllEmployee(){
    return this.http.get(this.baseUrl+'get-all-employee')
  }

  contact(name:string, email:string, subject:string, message:string){
    return this.http.get(this.baseUrl+'contact', {params:{name, email, subject, message}})
  }
}
