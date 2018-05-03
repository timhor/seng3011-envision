import { Injectable/*, text*/ } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import 'rxjs/add/operator/map';
import { Company } from './company';

@Injectable()
export class CallerService {

  private stockInfo: string = "http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/";
  private newsInfo: string = "http://seng.fmap.today/v2/news";
  private companies: Company[];

  constructor(private http: HttpClient) {
      this.http.get('../assets/ASXListedCompanies.json').subscribe(val => this.companies = <Company[]> val);
  }

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

  //from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?rq=1
  private shuffleArray(array:string[]) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }

  //because fuzzysearch ~= random elements
  instrumentFuzzySearch(queryString: string) {
    var tempArray: string[] = this.companies.
      map(function (x:Company){
          return x.name;
      }).
      filter(function(x:string){
          return x.toLowerCase().indexOf(queryString)!==-1;
      });
      return this.shuffleArray(tempArray).slice(0,7);
  }

}
