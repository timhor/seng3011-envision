import { Component, OnInit } from '@angular/core';
import { Company } from '../company';
import { Subscription } from 'rxjs/Subscription';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { NewsInfo } from '../newsinfo';

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

      tempArray = tempArray.slice(0, 10);
      tempArray.forEach(instrument => {
        // Check if found 5 pieces of article already
        console.log(instrument);
        let newsParams: HttpParams = new HttpParams();
        newsParams = newsParams.append('q', instrument);
        newsParams = newsParams.append('sortBy', 'relevancy');
        if (this.trendingNews.length === 5) {
          return;
        }
        this.callerService.getNewsInfo(newsParams).subscribe((result) => {
          this.newsResponse = result;
          const news = new NewsInfo('', '', '', '', '', '', instrument);;
          let index = 0;
          // Check if any articles otherwise continue to next instrument
          if (this.newsResponse['totalResults'] === 0) {
            console.log('Didnt find any articles');
            return;
          }
          let e = this.newsResponse['articles'][index];
          let foundImage = false;
          // Keep going through articles until an article with image is found
          while (foundImage !== true) {
            if (e['urlToImage'] === undefined || e['urlToImage'] === '' || e['urlToImage'] === null) {
              index++;
              console.log('Could not find image url, checking next article!');
              // Check if there is a next article otherwise continue to next instrument
              if (this.newsResponse['articles'][index] !== undefined) {
                e = this.newsResponse['articles'][index];
              } else {
                return;
              }
            } else {
              foundImage = true;
            }
          }
          if (foundImage === true) {
            // Create news object with the data
            news.title = e['title'];
            news.description = e['description'];
            news.author = e['author'];
            if (news.author === null) {
              news.author = 'Unknown';
            }
            news.url = e['url'];
            news.imageUrl = e['urlToImage'];
            news.date = new Date(e['publishedAt']).toLocaleDateString();
            // Add this news object to trendingNews
            this.trendingNews.push(news);
            console.log(this.trendingNews.length.toString());
          }
        });
      });

      // tempArray.forEach(instrument => {
      //   console.log(instrument);
      //   let guardianParams: HttpParams = new HttpParams();

      //   guardianParams = guardianParams.append('q', instrument);
      //   guardianParams = guardianParams.append('order-by', 'newest');
      //   guardianParams = guardianParams.append('show-fields', 'headline,trailText,byline,thumbnail');
      //   guardianParams = guardianParams.append('page-size', this.pageSize.toString());

      //   this.callerService.getGuardianInfo(guardianParams).subscribe((result) => {
      //     this.newsResponse = result;
      //     let isDuplicate = true;
      //     let e = null;
      //     let index = 0;
      //     // Keep finding until we have found a non-duplicate news
      //     while (isDuplicate === true) {
      //       isDuplicate = false;
      //       e = this.newsResponse['response']['results'][index];
      //       // Check if this article has already been selected
      //       this.trendingNews.forEach(element => {
      //         if (element['headline'] ===  e['fields']['headline']) {
      //           isDuplicate = true;
      //         }
      //       });
      //       index++;
      //     }
      //     const news = {'headline': '', 'trailtext': '', 'byline': '', thumbnail: '', webUrl: '', 'date': '', 'instrument': instrument};
      //     news.headline = e['fields']['headline'];
      //     news.trailtext = e['fields']['trailText'];
      //     news.byline = e['fields']['byline'];
      //     news.webUrl = e['webUrl'];
      //     if (news.byline === '') {
      //       news.byline = 'Guardian news';
      //     }
      //     news.thumbnail = e['fields']['thumbnail'];
      //     news.date = e['webPublicationDate'];
      //     this.trendingNews.push(news);
      //     console.log(news);
      //   });
      // });
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
