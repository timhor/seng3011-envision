import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CallerService } from './caller.service';
import { HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public company = '';
<<<<<<< HEAD
  public stocksResponse: object;
  public newsResponse: object;
  private results: string[] = [];
=======
  public searchResponse: Object = null;
  private companySuggestions: string[] = [];
  public startDate: Date = null;
  public endDate: Date = null;
  public news: Object = null;

  constructor(private callerService: CallerService) {}
>>>>>>> 25415d6b66621863186dd8b547c16c770329e350

  @ViewChild('sidenav') sidenav: MatSidenav;
  public navMode = 'side';

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.navMode = 'over';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 768) {
      this.navMode = 'over';
      this.sidenav.close();
    }
    if (event.target.innerWidth > 768) {
      this.navMode = 'side';
      this.sidenav.open();
    }
  }

  onLinkClick() {
    if (window.innerWidth < 768) {
      this.sidenav.close();
    }
  }

  onSubmit() {
<<<<<<< HEAD
    let params: HttpParams = new HttpParams();
    params = params.append('instrument_id', this.company);
    params = params.append('date_of_interest', '2018-05-02');
    this.callerService.getStockInfo(params).subscribe(
      (result) => {
        console.log(result);
        this.stocksResponse = result;
      }
    );
    params = new HttpParams();
    params = params.append('company', this.company);
    params = params.append('start_date', '2018-04-02');
    params = params.append('end_date', '2018-05-02');
    this.callerService.getNewsInfo(params).subscribe(
      (result) => {
        console.log(result);
        this.newsResponse = result;
      }
    );
  }

  observableSource = (q: string): Observable<any[]> => {
    this.results = q ? this.callerService.instrumentFuzzySearch(q) : [];
    return (Observable.of(this.results));
=======
    if (this.company.length > 0) {
      let stockParams: HttpParams = new HttpParams();
      stockParams = stockParams.append('instrument_id', this.company);
      stockParams = stockParams.append('date_of_interest', '2018-05-02');
      this.callerService.getStockInfo(stockParams).subscribe(
        (result) => {
          console.log(result);
          this.searchResponse = result;
        }
      );
    }
    if (this.company.length > 0 && this.startDate !== null && this.endDate !== null) {
      let newsParams: HttpParams = new HttpParams();
      newsParams = new HttpParams();
      newsParams = newsParams.append('company', this.company);
      newsParams = newsParams.append('start_date', this.startDate.toString());
      newsParams = newsParams.append('end_date', this.endDate.toString());
      this.callerService.getNewsInfo(newsParams).subscribe(
        (result) => {
          console.log(result);
          this.news = result;
        }
      );
    }
  }

  updateDropdown(q: string) {
    this.companySuggestions = q ? this.callerService.instrumentFuzzySearch(q) : [];
>>>>>>> 25415d6b66621863186dd8b547c16c770329e350
  }
}
