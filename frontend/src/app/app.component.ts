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
  public stocksResponse: object;
  public newsResponse: object;
  private results: string[] = [];

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

  constructor(private callerService: CallerService) { }

  onSubmit() {
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
  }
}
