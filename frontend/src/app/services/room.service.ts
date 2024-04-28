import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private baseUrl: string = 'https://localhost:7072/room/';

  constructor(private http: HttpClient) {}

  getAllRoom() {
    return this.http.get(this.baseUrl + 'get-all-room');
  }

  getRooms() {
    return this.http.get(this.baseUrl);
  }

  getRoomByID(id: number) {
    return this.http.get(this.baseUrl + 'get-room-by-id', { params: { id } });
  }

  updateStatusRoom(id:number, name:string, status:string){
    return this.http.post(this.baseUrl+"update-status-room", {}, {params: {id, name, status}})
  }

  addNewRoom(name:string, status:string){
    return this.http.post(this.baseUrl+"add-new-room", {}, {params: {name, status}})
  }
}
