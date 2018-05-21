import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';
import { NewsInfo } from '../newsinfo';
import { Company } from '../company';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public query = 'CBA';
  public newsResponse: Object = null;
  public startDate: Date = null;
  public endDate: Date = null;
  public panelState = false;
  public searchedNews: any[] = [];
  private pageSize = '10';
  public sortOptions: string[] = ['Relevance', 'Newest', 'Popularity'];
  public sortBy = 'Relevance';

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

  ngOnInit() {
  }


  private getQuery() {
    this.searchedNews = [];
    let newsParams: HttpParams = new HttpParams();
    if (this.query.split(' ').length <= 2) {
      newsParams = newsParams.append('q', '\"' + this.query + '\"');
    } else {
      newsParams = newsParams.append('q', '\"' + this.query.replace(/ (\w+)$/, '') + '\"');
    }

    let sortByVal = 'relevancy';
    if (this.sortBy === this.sortOptions[1]) {
      sortByVal = 'publishedAt';
    } else if (this.sortBy === this.sortOptions[2]) {
      sortByVal = 'popularity';
    }
    newsParams = newsParams.append('sortBy', sortByVal);

    if (this.startDate !== null && this.endDate !== null) {
      const from = new Date(this.startDate);
      const to = new Date(this.endDate);
      if (from.getTime() < to.getTime()) {
        newsParams = newsParams.append('from', this.getDateString(from));
        newsParams = newsParams.append('to', this.getDateString(to));
      }
    }

    // Remove everything after '.' for CBA.AX cases otherwise, CBA will not be an option
    this.query = this.query.replace(/\..*/, '');
    // Remove everything before ':' for ASX:CBA cases
    this.query = this.query.replace(/.*\:/, '');
    this.query = this.query.toUpperCase();
    const companies: Company[] = this.callerService.instrumentFuzzySearch(this.query);
    let instrument = '';
    companies.forEach(c => {
      if (c.name.includes(this.query) || c.code.includes(this.query)) {
        instrument = c.name;
      }
    });
    this.callerService.getNewsInfo(newsParams).subscribe((result) => {
      this.newsResponse = result;
      this.newsResponse['articles'] = this.newsResponse['articles'].filter(e => {
        // console.log(e);
        if (e['title'].includes('&amp')) { return false; }
        if (e['description'].includes('&amp')) { return false; }
        if (e['source']['name'].includes('Salon.com')) { return false; }
        return true;
      });
      this.newsResponse['articles'].forEach(e => {
        const news = new NewsInfo('', '', '', '', '', '', instrument);
        news.title = e['title'];
        news.url = e['url'];
        news.author = e['author'];
        if (news.author === null) {
          news.author = 'Unknown';
        }
        news.imageUrl = e['urlToImage'];
        if (e['urlToImage'] === undefined || e['urlToImage'] === '' || e['urlToImage'] === null) {
          news.imageUrl = 'http://via.placeholder.com/900x500';
        }
        news.description = e['description'];
        news.date = new Date(e['publishedAt']).toLocaleDateString();
        this.searchedNews.push(news);
      });
    });
  }

  analyse(news: any) {
    console.log(news);
    this.callerService.setAnalysisInfo(news);
    this.router.navigate(['analysis']);
  }

  private getDateString(date: Date) {
    // month starts at 0
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }
}
