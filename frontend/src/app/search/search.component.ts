import { Component, OnInit } from '@angular/core';
import { CallerService } from "../caller.service";
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public company: string = '';
  public startDate: Date = null;
  public endDate: Date = null;

  constructor(private callerService: CallerService) { }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.company);
    console.log(this.startDate);
    console.log(this.endDate);
    let params: HttpParams = new HttpParams();
    params = params.append("instrument_id", this.company);
    params = params.append("date_of_interest", this.startDate.toString());
    this.callerService.getStockInfo(params).subscribe(
      (result) => console.log(result)
    );
  }

}
