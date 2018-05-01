import { Component, OnInit } from '@angular/core';
import { CallerService } from "../caller.service";

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
    console.log("Woooo.");
    console.log(this.company);
    console.log(this.startDate);
    console.log(this.endDate);
    this.callerService.getStockInfo('').subscribe(
      (result) => console.log(result)
    );
  }

}
