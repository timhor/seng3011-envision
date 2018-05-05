import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Company } from './company';

@Injectable()
export class CallerService {

  private stockInfo = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/';
  private newsInfo = 'http://seng.fmap.today/v2/news';
  private guardianInfo = 'https://content.guardianapis.com/search'
  private companies: Company[];

  private indexNames: Map<string, string> = new Map<string, string>();
  private industries: Map<string, string> = new Map<string, string>();


  constructor(private http: HttpClient) {
    this.http.get('../assets/ASXListedCompanies.json').subscribe(val => this.companies = <Company[]> val);
    // Commented out ones are currently not used by any of our industries
    // this.indexNames.set('^AXGD', 'All Orginaries Gold Index');
    this.indexNames.set('^AXPJ', 'A-REIT Index');
    this.indexNames.set('^AXDJ', 'Consumer Discretionary Index');
    this.indexNames.set('^AXSJ', 'Consumer Staples Index');
    this.indexNames.set('^AXEJ', 'Energy Index');
    this.indexNames.set('^AXFJ', 'Financial Index');
    // this.indexNames.set('^AXXJ', 'Financials excluding A-REITs Index');
    this.indexNames.set('^AXHJ', 'Health Care Index');
    this.indexNames.set('^AXNJ', 'Industrials Index');
    this.indexNames.set('^AXIJ', 'Information Technology Index');
    this.indexNames.set('^AXMJ', 'Materials Index');
    // this.indexNames.set('^AXMM', 'Metals and Mining Index');
    // this.indexNames.set('^AXJR', 'Resources Index');
    this.indexNames.set('^AXTJ', 'Telecommunications Services Index');
    this.indexNames.set('^AXUJ', 'Utilities Index');
    this.indexNames.set('^AXJO', 'ASX200 Index');  // Default

    this.industries.set('Automobiles & Components', '^AXDJ');
    this.industries.set('Banks', '^AXPJ'); // Should we use XXJ - Financial sans REIT
    this.industries.set('Capital Goods', '^AXNJ');
    this.industries.set('Class Pend', '^AXJO'); // Default to ASX:XJO - ASX200
    this.industries.set('Commercial & Professional Services', '^AXNJ');
    this.industries.set('Consumer Durables & Apparel', '^AXDJ');
    this.industries.set('Consumer Services', '^AXDJ');
    this.industries.set('Diversified Financials', '^AXPJ');
    this.industries.set('Energy', '^AXEJ');
    this.industries.set('Food & Staples Retailing', '^AXSJ');
    this.industries.set('Food, Beverage & Tobacco', '^AXSJ');
    this.industries.set('Health Care Equipment & Services', '^AXHJ');
    this.industries.set('Household & Personal Products', '^AXSJ');
    this.industries.set('Insurance', '^AXFJ');
    this.industries.set('Materials', '^AXMJ');
    this.industries.set('Media', '^AXDJ');
    this.industries.set('Not Applic', '^AXJO'); // Default to ASX:XJO - ASX200
    this.industries.set('Pharmaceuticals, Biotechnology & Life Sciences', '^AXHJ');
    this.industries.set('Real Estate', '^AXPJ'); // Technically in XFJ - Financials
    this.industries.set('Retailing', '^AXDJ');
    this.industries.set('Semiconductors & Semiconductor Equipment', '^AXIJ');
    this.industries.set('Software & Services', '^AXIJ');
    this.industries.set('Technology Hardware & Equipment', '^AXIJ');
    this.industries.set('Telecommunication Services', '^AXTJ');
    this.industries.set('Transportation', '^AXNJ');
    this.industries.set('Utilities', '^AXUJ');
  }

  getStockInfo(params: HttpParams) {
    params = params.append('lower_window', '5');
    params = params.append('upper_window', '15');
    params = params.append('list_of_var', 'Return,Return_pct,CM_Return_pct');
    console.log(params);
    return this.http.get(this.stockInfo, { params : params });
  }

  getNewsInfo(params: HttpParams) {
    console.log(params);
    return this.http.get(this.newsInfo, { params : params });
  }

  getGuardianInfo(params: HttpParams) {
    params = params.append('api-key', '5dfacfce-5df1-47d1-9cbc-ee207b3ec525');
    return this.http.get(this.guardianInfo, { params : params });
  }

  getCompanies() {
    return this.http.get('../assets/ASXListedCompanies.json');
  }

  // from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?rq=1
  shuffleArray(array: string[]) {
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

  // Gets the stock index we want to compare to
  getStockIndex(company: string) {
    this.companies.forEach(e => {
      if (e.code === company) {
        if (this.industries.has(e.group)) {
          console.log(this.industries.get(e.group));
          return this.industries.get(e.group);
        }
      }
    });
    return '^AXJO'; // Default
  }

}
