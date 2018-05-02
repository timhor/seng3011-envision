import { Component } from '@angular/core';
import { CallerService } from "./caller.service";
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public company: string = '';
  public searchResponse: object;

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
