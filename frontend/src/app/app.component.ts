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
  public stocksResponse: Object = null;
  public newsResponse: Object = null;
  private companySuggestions: string[] = [];
  public startDate: Date = null;
  public endDate: Date = null;
  public news: Object = null;

  public indexNames: Map<string, string> = new Map<string, string>();
  public indices: Map<string, string> = new Map<string, string>();

  constructor(private callerService: CallerService) {
    this.indexNames.set("XGD", "All Ordinaries Gold Index");
    this.indexNames.set("XPJ", "A-REIT Index");
    this.indexNames.set("XDJ", "Consumer Discretionary Index");
    this.indexNames.set("XSJ", "Consumer Staples Index");
    this.indexNames.set("XEJ", "Energy Index");
    this.indexNames.set("XFJ", "Financial Index");
    this.indexNames.set("XXJ", "Financials excluding A-REITs Index");
    this.indexNames.set("XHJ", "Health Care Index");
    this.indexNames.set("XNJ", "Industrials Index");
    this.indexNames.set("XIJ", "Information Technology Index");
    this.indexNames.set("XMJ", "Materials Index");
    this.indexNames.set("XMM", "Metals and Mining Index");
    this.indexNames.set("XJR", "Resources Index");
    this.indexNames.set("XTJ", "Telecommunications Services Index");
    this.indexNames.set("XUJ", "Utilities Index");
    this.indexNames.set("XJO", "ASX200 Index");  // Default

    this.indices.set("Automobiles & Components", "XDJ");
    this.indices.set("Banks", "XPJ");
    this.indices.set("Capital Goods", "XNJ");
    this.indices.set("Class Pend", "XJO");
    this.indices.set("Commercial & Professional Services", "XNJ");
    this.indices.set("Consumer Durables & Apparel", "XDJ");
    this.indices.set("Consumer Services", "XDJ");
    this.indices.set("Diversified Financials", "XPJ");
    this.indices.set("Energy", "XEJ");
    this.indices.set("Food & Staples Retailing", "XSJ");
    this.indices.set("Food, Beverage & Tobacco", "XSJ");
    this.indices.set("Health Care Equipment & Services", "XHJ");
    this.indices.set("Household & Personal Products", "XSJ");
    this.indices.set("Insurance", "XFJ");
    this.indices.set("Materials", "XMJ");
    this.indices.set("Media", "XDJ");
    this.indices.set("Not Applic", "XJO");
    this.indices.set("Pharmaceuticals, Biotechnology & Life Sciences", "XHJ");
    this.indices.set("Real Estate", "XPJ"); // Technically in XFJ - Financials
    this.indices.set("Retailing", "XDJ");
    this.indices.set("Semiconductors & Semiconductor Equipment", "XIJ");
    this.indices.set("Software & Services", "XIJ");
    this.indices.set("Technology Hardware & Equipment", "XIJ");
    this.indices.set("Telecommunication Services", "XTJ");
    this.indices.set("Transportation", "XNJ");
    this.indices.set("Utilities", "XUJ");
  }

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
    if (this.company.length > 0) {
      let stockParams: HttpParams = new HttpParams();
      stockParams = stockParams.append('instrument_id', this.company);
      stockParams = stockParams.append('date_of_interest', '2018-05-02');
      this.callerService.getStockInfo(stockParams).subscribe(
        (result) => {
          console.log(result);
          this.stocksResponse = result;
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
          this.newsResponse = result;
        }
      );
    }
  }

  updateAutocomplete(q: string) {
    this.companySuggestions = q ? this.callerService.instrumentFuzzySearch(q) : [];
    return this.companySuggestions;
  }
}
