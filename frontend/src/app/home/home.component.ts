import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Company } from '../company';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = 'Envision Client';
  public trendingNews = [];
  public companies: Company[];
  private newsAPI = 'http://seng.fmap.today/v2/news';
  private startDate: Date = null;
  private endDate: Date = null;

  constructor (private http: HttpClient) {
    this.http.get('../../assets/ASXListedCompanies.json').subscribe((val) => {
      this.companies = <Company[]> val;
      let tempArray: string[] = this.companies.map((x: Company) => x.code);
      tempArray = this.shuffleArray(tempArray);

      let newsFound = 0;
      tempArray.forEach(instrumentID => {
        if (newsFound !== 5) {
          this.getNewsInfo(instrumentID).subscribe((data) => {
            // Check if there are any news posted
            if (data.totalResults >= 0) {
              // Keep track articles, to find a single article which has an image url
              let foundArticle: Boolean = false;
              data.articles.forEach(article => {
                // Check if article has url, and we havent found an article already
                if (article.urlToImage != null && foundArticle !== true) {
                  console.log(article);
                  // Add article to trending news
                  this.trendingNews.push(article);
                  foundArticle = true;
                  newsFound = newsFound + 1;
                }
              });
            }
            console.log(data);
          });
        }
      });
    });
  }

  // from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?rq=1
  shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  getNewsInfo(companyCode: string) {
    this.endDate = new Date();
    this.startDate = new Date(this.endDate);
    this.startDate.setDate(this.endDate.getDate() - 1);
    const start: string = this.startDate.toISOString().substr(0, 10).toString();
    const end: string = this.endDate.toISOString().substr(0, 10).toString();

    const apiUrl: string = this.newsAPI + `?company=${companyCode}&start_date=${start}&end_date=${end}`;
    return this.http.get(apiUrl);
  }
}
