import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MachineLearningService {
  private baseUrl: string = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient) {}

  diseasePrediction(lstSymtoms: any) {
    return this.http.get(this.baseUrl + 'disease-prediction', {
      params: { lstSymtoms },
    });
  }

  revenuePrediction(
    startDate: string,
    endDate: string,
    time: number,
    lstRevenue: string
  ) {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('time', time)
      .set('lstRevenue', lstRevenue);
    return this.http.get(this.baseUrl + 'revenue-forecast', {
      params,
      responseType: 'blob',
    });
  }
}
