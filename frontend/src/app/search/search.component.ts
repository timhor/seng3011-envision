import { Component, OnInit, ViewChild } from '@angular/core';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TrendInfo } from './trendinfo';
import { MatExpansionPanel } from '@angular/material';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  public query = '';
  public stocksResponse: Object = null;
  public newsResponse: Object = null;
  public startDate: Date = null;
  public endDate: Date = null;
  public panelState = false;
  public guardianResponse: any[] = [];

  @ViewChild('filtersPanel') panel: MatExpansionPanel;

  public companyTS: number[] = null;
  public indexTS: number[] = null;
  public trendInfo: TrendInfo = new TrendInfo();

  public constructor(private route: ActivatedRoute, private callerService: CallerService) {
    this.route.queryParams.subscribe(params => {
        this.query = params['search_query'];
        if (this.query) {
          this.getQuery();
        } else {
          this.stocksResponse = null;
          this.newsResponse = null;
        }
    });
  }

  private analyseTrends(company: string, date: Date) {
    let companyID: string = company;
    if (company.includes(':')) {
      companyID = company.split(':')[1];
    } else if (company.includes('.')) {
      companyID = company.split('.')[0];
    }

    const index: string = this.callerService.getStockIndex(companyID);
    let params: HttpParams = new HttpParams();
    params = params.append('instrument_id', company + ',' + index);
    const tempDate: string = new Date(date).toISOString().slice(0, 10);
    params = params.append('date_of_interest', tempDate);

    this.callerService.getStockInfo(params).subscribe((result) => {
      this.stocksResponse = result;
      this.trendInfo.rawQuery = result;

      let i: number;
      let array: number[];
      for (i = 0; i < 2; i++) {
        array = [];
        this.stocksResponse['Company_Returns'][i]['Data'].forEach(e => {
          array.push(e['Return_pct']);
        });
        if (this.stocksResponse['Company_Returns'][i]['InstrumentID'] === index) {
          this.indexTS = array;
        } else {
          this.companyTS = array;
        }
      }
      // Pearson correlation coefficient
      this.trendInfo.longRangeCorrelation = this.getPearsonCorrelation(this.indexTS, this.companyTS);
      this.trendInfo.shortRangeCorrelation = this.getPearsonCorrelation(this.indexTS.slice(4, 15), this.companyTS.slice(4, 15));
      this.trendInfo.analysis = this.stateAnalysis();
      this.trendInfo.hidden = false;
      console.log(this.trendInfo);
    });

  }

  private stateAnalysis() {
    // Check if it was an overall increase or not
    if (Math.abs(this.trendInfo.longRangeCorrelation - this.trendInfo.shortRangeCorrelation)) {

    }
    return 'Test123';
  }

  /*
  *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
  */
  private getPearsonCorrelation(x, y) {
    let shortestArrayLength = 0;

    if (x.length === y.length) {
        shortestArrayLength = x.length;
    } else if (x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    const xy = [];
    const x2 = [];
    const y2 = [];

    for (let i = 0; i < shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_x2 = 0;
    let sum_y2 = 0;

    for (let i = 0; i < shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }

    const step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    const step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    const step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    const step4 = Math.sqrt(step2 * step3);
    const answer = step1 / step4;

    return answer;
  }

  public togglePanel() {
    this.panel.close();
    this.getQuery();
  }

  private getQuery() {
    if (this.startDate !== null) {
      this.analyseTrends(this.query, this.startDate); // TODO: Use this to find stuff
    }
    if (this.startDate !== null && this.endDate !== null) {
      let newsParams: HttpParams = new HttpParams();
      const startDateStr: string = new Date(this.startDate).toISOString().slice(0, 10);
      const endDateStr: string = new Date(this.endDate).toISOString().slice(0, 10);
      newsParams = newsParams.append('company', this.query);
      newsParams = newsParams.append('start_date', startDateStr);
      newsParams = newsParams.append('end_date', endDateStr);
      this.callerService.getNewsInfo(newsParams).subscribe(
        (result) => {
          this.newsResponse = result;
        }
      );
    }
    let guardianParams: HttpParams = new HttpParams();
    guardianParams = guardianParams.append('q', this.query);
    this.callerService.getGuardianInfo(guardianParams).subscribe(
      (result) => {
        this.newsResponse = result;
        this.newsResponse['response']['results'].forEach(e => {
          const news = {'title': '', 'url': ''};
          news.title = e['webTitle'];
          news.url = e['webUrl'];
          this.guardianResponse.push(news);
        });
      }
    );
  }
}
