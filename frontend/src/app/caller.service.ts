import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class CallerService {

  private stockInfo: string = "http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/";
  private newsInfo: string = "http://seng.fmap.today/v2/news";

  constructor(private http: HttpClient) { }

  getStockInfo(params: HttpParams) {
    params = params.append("lower_window", "5");
    params = params.append("upper_window", "15");
    params = params.append("list_of_var", "Return");
    console.log(params);
    return this.http.get(this.stockInfo, { params : params });
  }

  getNewsInfo(params: HttpParams) {
    console.log(params);
    return this.http.get(this.newsInfo, { params : params });
  }

}
