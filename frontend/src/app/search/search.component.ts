import { Component, OnInit, ViewChild } from '@angular/core';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionPanel } from '@angular/material';
import { Router } from '@angular/router';

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
  private pageSize = '10';

  public searchResponse: Object[] = [];

  @ViewChild('filtersPanel') panel: MatExpansionPanel;

  public companyTS: number[] = null;
  public indexTS: number[] = null;
  // public trendInfo: TrendInfo = new TrendInfo();

  public constructor(private route: ActivatedRoute, private callerService: CallerService, private router: Router) {
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

  private getQuery() {
    this.guardianResponse = [];
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
    guardianParams = guardianParams.append('order-by', 'newest');
    guardianParams = guardianParams.append('show-fields', 'byline,thumbnail,trailText');
    guardianParams = guardianParams.append('page-size', this.pageSize);
    this.callerService.getGuardianInfo(guardianParams).subscribe(
      (result) => {
        this.newsResponse = result;
        this.newsResponse['response']['results'].forEach(e => {
          const news = {'title': '', 'url': '', 'byline': '', 'thumbnail': '', 'trailtext': '', 'date': '', 'instrument': this.query};
          news.title = e['webTitle'];
          news.url = e['webUrl'];
          news.byline = e['fields']['byline'];
          news.thumbnail = e['fields']['thumbnail'];
          news.trailtext = e['fields']['trailText'];
          news.date = e['webPublicationDate'];
          // Need to add this in after we move to the analysis page
          // news.trendInfo = this.analyseTrends(this.query, e.webPublicationDate);
          this.guardianResponse.push(news);
        });
      }
    );
  }

  analyse(news: any) {
    console.log(news);
    this.callerService.setAnalysisInfo(news);
    this.router.navigate(['analysis']);
  }
}
