import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private baseUrl: string = 'https://localhost:7072/regulation/';

  constructor(private http: HttpClient) {}

  getQuantityAppointment() {
    return this.http.get(this.baseUrl);
  }

  updateQuantityAppointment(quantityAppointment:number){
    return this.http.post(this.baseUrl + 'update-regulation', {}, {params: {quantityAppointment}});
  }
}
