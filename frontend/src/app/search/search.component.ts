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
  public newsResponse: Object = null;
  public startDate: Date = null;
  public endDate: Date = null;
  public panelState = false;
  public searchedNews: any[] = [];
  private pageSize = '10';

  @ViewChild('filtersPanel') panel: MatExpansionPanel;

  public constructor(private route: ActivatedRoute, private callerService: CallerService, private router: Router) {
    this.route.queryParams.subscribe(params => {
        this.query = params['search_query'];
        if (this.query) {
          this.getQuery();
        } else {
          this.newsResponse = null;
        }
    });
  }

  public togglePanel() {
    this.panel.close();
    this.getQuery();
  }

  private getQuery() {
    let newsParams: HttpParams = new HttpParams();
    newsParams = newsParams.append('q', this.query);
    newsParams = newsParams.append('sortBy', 'relevancy');
    // TODO: incorporate dates into search
    // if (this.startDate !== null && this.endDate !== null) {
    // newsParams = newsParams.append('from', startDateStr);
    //   newsParams = newsParams.append('to', endDateStr);
    // }
    this.callerService.getNewsInfo(newsParams).subscribe((result) => {
      this.newsResponse = result;
<<<<<<< HEAD
      this.newsResponse['articles'].forEach(e => {
        const news = {'title': '', 'description': '', 'author': '', imageUrl: '', url: '', 'date': '', 'instrument': this.query};
        // TODO: search for business name from query and set it as instrument
        news.title = e['title'];
        news.url = e['url'];
        news.author = e['author'];
        if (news.author === null) {
          news.author = 'Unknown';
        }
        news.imageUrl = e['urlToImage'];
        if (e['urlToImage'] === undefined || e['urlToImage'] === '' || e['urlToImage'] === null) {
          news.imageUrl = 'http://via.placeholder.com/1300x350';
        }
        news.description = e['description'];
        news.date = e['publishedAt'];
        this.searchedNews.push(news);
      });
=======
        this.newsResponse['articles'].forEach(e => {
          const news = {'title': '', 'description': '', 'author': '', imageUrl: '', url: '', 'date': '', 'instrument': this.query};
          // TODO: search for business name from query and set it as instrument
          news.title = e['title'];
          news.url = e['url'];
          news.author = e['author'];
          if (news.author === null) {
            news.author = 'Unknown';
          }
          news.imageUrl = e['urlToImage'];
          if (e['urlToImage'] === undefined || e['urlToImage'] === '' || e['urlToImage'] === null) {
            news.imageUrl = 'http://via.placeholder.com/1300x350';
          }
          news.description = e['description'];
          news.date = e['publishedAt'];
          this.searchedNews.push(news);
        });
>>>>>>> f905bf498f2eb173aeaeecfd94b67a748991bed4
    });
  }

  analyse(news: any) {
    console.log(news);
    this.callerService.setAnalysisInfo(news);
    this.router.navigate(['analysis']);
  }
}
