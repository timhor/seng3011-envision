import { Component, OnInit } from '@angular/core';
import { Company } from '../company';
import { Subscription } from 'rxjs/Subscription';
import { CallerService } from '../caller.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = 'Envision Client';
  public trendingNews = [];
  public companies: Company[];
  private startDate: Date = null;
  private endDate: Date = null;

  constructor (private callerService: CallerService) {

    this.callerService.getCompanies().subscribe((val) => {
      this.companies = <Company[]> val;
      let tempArray: string[] = this.companies.map((x: Company) => x.code);
      tempArray = this.callerService.shuffleArray(tempArray);

      let newsFound = 0;
      tempArray.forEach(instrumentID => {
        if (newsFound !== 5) {
          const newsParams: HttpParams = new HttpParams();
          newsParams.append('company', instrumentID);
          this.callerService.getNewsInfo(newsParams).subscribe((data) => {
            // Check if there are any news posted
            // if (data.totalResults >= 0) {
            //   // Keep track articles, to find a single article which has an image url
            //   let foundArticle: Boolean = false;
            //   data.articles.forEach(article => {
            //     // Check if article has url, and we havent found an article already
            //     if (article.urlToImage != null && foundArticle !== true) {
            //       console.log(article);
            //       // Add article to trending news
            //       this.trendingNews.push(article);
            //       foundArticle = true;
            //       newsFound = newsFound + 1;
            //     }
            //   });
            // }
            console.log(data);
          });
        }
      });
    });
  }
}
