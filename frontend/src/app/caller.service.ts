import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Company } from './company';

@Injectable()
export class CallerService {

  private stockInfo = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/';
  private newsInfo = 'http://seng.fmap.today/v2/news';
  private companies: Company[];

  constructor(private http: HttpClient) {
    this.http.get('../assets/ASXListedCompanies.json').subscribe(val => this.companies = <Company[]> val);
  }

  getStockInfo(params: HttpParams) {
    params = params.append('lower_window', '5');
    params = params.append('upper_window', '15');
    params = params.append('list_of_var', 'Return');
    console.log(params);
    return this.http.get(this.stockInfo, { params : params });
  }

  getNewsInfo(params: HttpParams) {
    console.log(params);
    return this.http.get(this.newsInfo, { params : params });
  }

  // from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?rq=1
  private shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  // because fuzzysearch ~= random elements
  instrumentFuzzySearch(queryString: string) {
    const tempArray: string[] = this.companies
      .map((x: Company) => x.name)
      .filter((x: string) => x.toLowerCase().indexOf(queryString) !== -1);
    return this.shuffleArray(tempArray).slice(0, 7);
  }

}
