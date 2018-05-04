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

  @ViewChild('filtersPanel') panel: MatExpansionPanel;

  public companyTS: number[] = null;
  public indexTS: number[] = null;
  public trendInfo: TrendInfo = new TrendInfo();

  public constructor(private route: ActivatedRoute, private callerService: CallerService) {
    this.route.queryParams.subscribe(params => {
        this.query = params['search_query'];
        if (this.query) {
          if (this.startDate !== null) {
            this.analyseTrends(this.query, this.startDate); // TODO: Use this to find stuff
          }
          if (this.startDate !== null && this.endDate !== null) {
            let newsParams: HttpParams = new HttpParams();
            newsParams = new HttpParams();
            newsParams = newsParams.append('company', this.query);
            newsParams = newsParams.append('start_date', this.startDate.toString());
            newsParams = newsParams.append('end_date', this.endDate.toString());
            this.callerService.getNewsInfo(newsParams).subscribe(
              (result) => {
                this.newsResponse = result;
              }
            );
          }
          this.getQuery();
        } else {
          this.stocksResponse = null;
          this.newsResponse = null;
        }
    });
  }

  analyseTrends(company: string, date: Date) {
    let companyID: string = company;
    if (company.includes(':')) {
      companyID = company.split(':')[1];
    } else if (company.includes('.')) {
      companyID = company.split('.')[0];
    }

    const index: string = this.callerService.getStockIndex(companyID);
    let params: HttpParams = new HttpParams();
    params = params.append('instrument_id', company + ',' + index);
    params = params.append('date_of_interest', date.toString());

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
      this.trendInfo.analysis = 'Test123';
      this.trendInfo.hidden = false;
      console.log(this.trendInfo);
    });

  }

  /*
  *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
  */
  getPearsonCorrelation(x, y) {
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

  public togglePanel() {
    this.panel.close();
    this.getQuery();
  }

  public getQuery() {
    let stockParams: HttpParams = new HttpParams();
    stockParams = stockParams.append('instrument_id', this.query);
    stockParams = stockParams.append('date_of_interest', (new Date()).toISOString().substr(0, 10));
    this.callerService.getStockInfo(stockParams).subscribe(
      (result) => {
        this.stocksResponse = result;
      }
    );
    if (this.startDate !== null && this.endDate !== null) {
      let newsParams: HttpParams = new HttpParams();
      newsParams = new HttpParams();
      newsParams = newsParams.append('company', this.query);
      newsParams = newsParams.append('start_date', this.startDate.toString());
      newsParams = newsParams.append('end_date', this.endDate.toString());
      this.callerService.getNewsInfo(newsParams).subscribe(
        (result) => {
          this.newsResponse = result;
        }
      );
    }
  }
}
