import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CallerService } from './caller.service';
import { HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public company = '';
  public searchResponse: object;
  private companySuggestions: string[] = [];
  public startDate: Date = null;
  public endDate: Date = null;
  public news: Object = null;

  constructor(private callerService: CallerService) {}

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
    let params: HttpParams = new HttpParams();
    params = params.append('instrument_id', this.company);
    params = params.append('date_of_interest', '2018-05-02');
    this.callerService.getStockInfo(params).subscribe(
      (result) => {
        console.log(result);
        this.searchResponse = result;
      }
    );
    params = new HttpParams();
    params = params.append('company', this.company);
    params = params.append('start_date', this.startDate.toString());
    params = params.append('end_date', this.endDate.toString());
    this.callerService.getNewsInfo(params).subscribe(
      (result) => {
        console.log(result);
        this.news = result;
      }
    );
  }

  updateDropdown(q: string) {
    this.companySuggestions = q ? this.callerService.instrumentFuzzySearch(q) : [];
  }
}
