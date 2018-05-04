import { Component, OnInit, ViewChild } from '@angular/core';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
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
