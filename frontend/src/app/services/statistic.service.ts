import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private baseUrl: string = 'https://localhost:7072/statistic/';

  constructor(private http: HttpClient) {}

  getTotalStatistic() {
    return this.http.get(this.baseUrl + 'total-statistic');
  }

  getDateStatistic(dateFrom:string, dateTo:string) {
    return this.http.get(this.baseUrl + 'date-statistic', {
      params: { dateFrom, dateTo },
    });
  }

  getRevenuePrediction(){
    return this.http.get(this.baseUrl + 'get-revenue-prediction');
  }
}
