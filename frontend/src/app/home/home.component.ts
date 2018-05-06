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
          let e = null;
          let index = 0;
          // Keep finding until we have found a non-duplicate news
          while (isDuplicate === true) {
            isDuplicate = false;
            e = this.newsResponse['response']['results'][index];
            // Check if this article has already been selected
            this.trendingNews.forEach(element => {
              if (element['headline'] ===  e['fields']['headline']) {
                isDuplicate = true;
              }
            });
            index++;
          }
          const news = {'headline': '', 'trailtext': '', 'byline': '', thumbnail: '', webUrl: '', 'date': '', 'instrument': instrument};
          news.headline = e['fields']['headline'];
          news.trailtext = e['fields']['trailText'];
          news.byline = e['fields']['byline'];
          news.webUrl = e['webUrl'];
          if (news.byline === '') {
            news.byline = 'Guardian news';
          }
          news.thumbnail = e['fields']['thumbnail'];
          news.date = e['webPublicationDate'];
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
    // this.callerService.getCompanies().subscribe((val) => {
    //   this.companies = <Company[]> val;
    //   let tempArray: string[] = this.companies.map((x: Company) => x.code);
    //   tempArray = this.callerService.shuffleArray(tempArray);

    //   let newsFound = 0;
    //   tempArray.forEach(instrumentID => {
    //     if (newsFound !== 5) {
    //       const newsParams: HttpParams = new HttpParams();
    //       newsParams.append('company', instrumentID);
    //       this.callerService.getNewsInfo(newsParams).subscribe((data) => {
    //         // Check if there are any news posted
    //         if (data['totalResults'] >= 0) {
    //           // Keep track articles, to find a single article which has an image url
    //           let foundArticle: Boolean = false;
    //           data['articles'].forEach(article => {
    //             // Check if article has url, and we havent found an article already
    //             if (article.urlToImage != null && foundArticle !== true) {
    //               console.log(article);
    //               // Add article to trending news
    //               this.trendingNews.push(article);
    //               foundArticle = true;
    //               newsFound = newsFound + 1;
    //             }
    //           });
    //         }
    //         console.log(data);
    //       });
    //     }
    //   });
    // });
  // }
