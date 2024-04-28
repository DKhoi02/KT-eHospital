import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private baseUrl: string = 'https://localhost:7072/role/';

  constructor(private http: HttpClient) {}

  getRoleName(role_id: number){
    return this.http.get(this.baseUrl + 'get-role-name', {
      params: { role_id },
      responseType: 'text'
    });
  }

  getAllRole(){
    return this.http.get(this.baseUrl)
  }
}
