import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class CallerService {

  private stockInfo: string = "http://envision-api.ap-southeast-2.elasticbeanstalk.com/";
  private newsInfo: string = "";

  constructor(private http: Http) { }

  getStockInfo(endpoint: string) {
    return this.http.get(this.stockInfo + endpoint);
  }

  getNewsInfo(endpoint: string) {
    return this.http.get(this.newsInfo + endpoint).map(response => response.json());
  }

}
