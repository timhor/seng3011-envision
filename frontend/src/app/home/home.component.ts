import { Component, OnInit } from '@angular/core';
import { Company } from '../company';
import { Subscription } from 'rxjs/Subscription';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = 'Envision Client';
  public trendingNews: any[] = [];
  private companies: Company[];
  private newsResponse: Object = null;
  private pageSize = 10;

  constructor (private callerService: CallerService, private router: Router) {

    this.callerService.getCompanies().subscribe((val) => {
      this.companies = <Company[]> val;
      let tempArray: string[] = this.companies.map((x: Company) => x.name);
      tempArray = this.callerService.shuffleArray(tempArray);

      tempArray = tempArray.slice(0, 5);

      tempArray.forEach(instrument => {
        console.log(instrument);
        let guardianParams: HttpParams = new HttpParams();

        guardianParams = guardianParams.append('q', instrument);
        guardianParams = guardianParams.append('order-by', 'newest');
        guardianParams = guardianParams.append('show-fields', 'headline,trailText,byline,thumbnail');
        guardianParams = guardianParams.append('page-size', this.pageSize.toString());

        this.callerService.getGuardianInfo(guardianParams).subscribe((result) => {
          this.newsResponse = result;
          // Select random of the 10 news
          let isDuplicate = true;
          let newsArticle = null;
          let index = 0;
          // Keep searching until we have found a non-duplicate news
          while (isDuplicate === true) {
            isDuplicate = false;
            newsArticle = this.newsResponse['response']['results'][index];
            for (let i = 0; i < this.trendingNews.length; i++) {
              if (this.trendingNews[i]['headline'] ===  newsArticle['fields']['headline']) {
                isDuplicate = true;
                break;
              }
            }
            index++;
          }
          const news = {'headline': '', 'trailtext': '', 'byline': '', thumbnail: '', webUrl: ''};
          news.headline = newsArticle['fields']['headline'];
          news.trailtext = newsArticle['fields']['trailText'];
          news.byline = newsArticle['fields']['byline'];
          news.webUrl = newsArticle['webUrl'];
          if (news.byline === '') {
            news.byline = 'Guardian news';
          }
          news.thumbnail = newsArticle['fields']['thumbnail'];
          this.trendingNews.push(news);
          console.log(news);
        });
      });
    });
  }

  // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
  private randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  analyse(news: any) {
    console.log(news);
    this.callerService.setAnalysisInfo(news);
    this.router.navigate(['analysis']);
  }
}
