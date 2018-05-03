import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CallerService } from "./caller.service";
import { HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public company: string = '';
  public searchResponse: object;

  @ViewChild('sidenav') sidenav: MatSidenav;
  public navMode: string = 'side';

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

  onLinkClick():void {
    if (window.innerWidth < 768) {
      this.sidenav.close();
    }
  }

  constructor(private callerService: CallerService) { }

  onSubmit() {
    let params: HttpParams = new HttpParams();
    params = params.append("instrument_id", this.company);
    params = params.append("date_of_interest", "2018-05-02");
    this.callerService.getStockInfo(params).subscribe(
      (result) => {
        console.log(result);
        this.searchResponse = result;
      }
    );
  }
}
