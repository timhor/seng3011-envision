import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Company } from './company';
import * as Fuse from 'fuse.js';

@Injectable()
export class CallerService {

  private stockInfo = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/api/v1.0.2/';
  private newsInfo = 'https://newsapi.org/v2/everything';
  private guardianInfo = 'http://content.guardianapis.com/search';
  private companies: Company[];

  private indexNames: Map<string, string> = new Map<string, string>();
  private industries: Map<string, string> = new Map<string, string>();

  private newsToAnalyse: Object = null;
  private instrument: string = null;

  private newsAPIKeys: Array<string> = [
    // '79791a6d2dac43258d382335a7dea367',
    // 'e9627d435bbd4f78ba672f45c71507b0',
    // 'd737b028898f49dda166eeb09427d22a',
    // '4a88a66efffd4ee6b44841779075b45b',
    // '37aebd18d2e1451dbee5e82ed1b4acd3',
    'd444e37791f147429a8568d40ab6e618',
    'dddcd54a00eb4ad89708103512d9628d',
    '0642b9d1bd0843f3aef17671a85a94a7',
    '1db93c6f87194c1da5dd876670e43d69',
    'd59df2d91c504f21aa03230772707b4f',
    '6c49eb7bc9a1439596c597cb35632d43',
    'ee2e1819d2bc487bb033304079a5e0f0',
    'aaaf86a72e2b4fed9e70b533ed0f984a',
    'cf6c1b16adad48e0b4bed1d68790b055',
    '3ca4aae81c4a46908fdfc8f1e63c8921'
  ];


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
    params = params.append('apiKey', this.newsAPIKeys[Math.floor(Math.random() * this.newsAPIKeys.length)]);
    return this.http.get(this.newsInfo, { params : params });
  }

  getGuardianInfo(params: HttpParams) {
    params = params.append('api-key', '24756ef7-a162-400a-ae15-361f58433bc6');
    return this.http.get(this.guardianInfo, { params : params });
  }

  getCompanies() {
    return this.http.get('../assets/ASXListedCompanies.json');
  }

  getRandomSample(sourceArray: Company[], neededElements: Number) {
    const result = [];
    for (let i = 0; i < neededElements; i++) {
        result.push(sourceArray[Math.floor(Math.random() * sourceArray.length)]);
    }
    return result;
  }

  instrumentFuzzySearch(queryString: string) {
    queryString = queryString.toUpperCase();
    const options = {
        keys: ['name', 'code'],
    };
    const fuse = new Fuse(this.companies, options);
    return <Company[]> fuse.search(queryString).slice(0, 5);
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

  // Gets the stock index we want to compare to
  getStockIndex(company: string) {
    let found = '^AXJO'; // Default
    this.companies.forEach(e => {
      if (e.code === company) {
        if (this.industries.has(e.group)) {
          found = this.industries.get(e.group);
        }
      }
    });
    return found;
  }

  getCompanyCode(companyName: string) {
    let found: string = null;
    this.companies.forEach(e => {
      if (e.name === companyName) {
        found = e.code;
      }
    });
    return found;
  }

  setAnalysisInfo(news: Object) {
    this.newsToAnalyse = news;
  }

  getAnalysisInfo() {
    return this.newsToAnalyse;
  }

  getInstrument() {
    return this.instrument;
  }

}
