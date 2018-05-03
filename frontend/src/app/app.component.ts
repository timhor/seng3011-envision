import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CallerService } from './caller.service';
import { HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public company = '';
  private companySuggestions: string[] = [];

  public indexNames: Map<string, string> = new Map<string, string>();
  public industries: Map<string, string> = new Map<string, string>();

  public constructor(private callerService: CallerService, private router: Router) {
    // Commented out ones are currently not used by any of our industries
    // this.indexNames.set("^AXGD", "All Orginaries Gold Index");
    this.indexNames.set("^AXPJ", "A-REIT Index");
    this.indexNames.set("^AXDJ", "Consumer Discretionary Index");
    this.indexNames.set("^AXSJ", "Consumer Staples Index");
    this.indexNames.set("^AXEJ", "Energy Index");
    this.indexNames.set("^AXFJ", "Financial Index");
    // this.indexNames.set("^AXXJ", "Financials excluding A-REITs Index");
    this.indexNames.set("^AXHJ", "Health Care Index");
    this.indexNames.set("^AXNJ", "Industrials Index");
    this.indexNames.set("^AXIJ", "Information Technology Index");
    this.indexNames.set("^AXMJ", "Materials Index");
    // this.indexNames.set("^AXMM", "Metals and Mining Index");
    // this.indexNames.set("^AXJR", "Resources Index");
    this.indexNames.set("^AXTJ", "Telecommunications Services Index");
    this.indexNames.set("^AXUJ", "Utilities Index");
    this.indexNames.set("^AXJO", "ASX200 Index");  // Default

    this.industries.set("Automobiles & Components", "^AXDJ");
    this.industries.set("Banks", "^AXPJ"); // Should we use XXJ - Financial sans REIT
    this.industries.set("Capital Goods", "^AXNJ");
    this.industries.set("Class Pend", "^AXJO"); // Default to ASX:XJO - ASX200
    this.industries.set("Commercial & Professional Services", "^AXNJ");
    this.industries.set("Consumer Durables & Apparel", "^AXDJ");
    this.industries.set("Consumer Services", "^AXDJ");
    this.industries.set("Diversified Financials", "^AXPJ");
    this.industries.set("Energy", "^AXEJ");
    this.industries.set("Food & Staples Retailing", "^AXSJ");
    this.industries.set("Food, Beverage & Tobacco", "^AXSJ");
    this.industries.set("Health Care Equipment & Services", "^AXHJ");
    this.industries.set("Household & Personal Products", "^AXSJ");
    this.industries.set("Insurance", "^AXFJ");
    this.industries.set("Materials", "^AXMJ");
    this.industries.set("Media", "^AXDJ");
    this.industries.set("Not Applic", "^AXJO"); // Default to ASX:XJO - ASX200
    this.industries.set("Pharmaceuticals, Biotechnology & Life Sciences", "^AXHJ");
    this.industries.set("Real Estate", "^AXPJ"); // Technically in XFJ - Financials
    this.industries.set("Retailing", "^AXDJ");
    this.industries.set("Semiconductors & Semiconductor Equipment", "^AXIJ");
    this.industries.set("Software & Services", "^AXIJ");
    this.industries.set("Technology Hardware & Equipment", "^AXIJ");
    this.industries.set("Telecommunication Services", "^AXTJ");
    this.industries.set("Transportation", "^AXNJ");
    this.industries.set("Utilities", "^AXUJ");
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
    const navigationExtras: NavigationExtras = {
      queryParams: {
          'search_query': this.company
      }
    };
    this.router.navigate(['search'], navigationExtras);
  }

  updateAutocomplete(q: string) {
    this.companySuggestions = q ? this.callerService.instrumentFuzzySearch(q) : [];
    return this.companySuggestions;
  }

  onDeactivate() {
    window.scrollTo(0, 0);
  }
}
