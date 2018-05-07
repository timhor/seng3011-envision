import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CallerService } from './caller.service';
import { HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';
import { Company } from './company';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public company = '';
  private companySuggestions: Company[] = [];
  public groups: string[] = [];

  public constructor(private callerService: CallerService, private router: Router) {
    // override the route reuse strategy so that accessing the same page with different params
    // continues to call all the necessary functions (otherwise search page doesn't show results
    // after the first query)
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
    };
  }

  @ViewChild('sidenav') sidenav: MatSidenav;
  public navMode = 'side';

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.navMode = 'over';
    }
    this.groups = this.callerService.getGroups();
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
    // Remove everything after '.' for CBA.AX cases otherwise, CBA will not be an option
    q = q.replace(/\..*/, '');
    // Remove everything before ':' for ASX:CBA cases
    q = q.replace(/.*\:/, '');
    this.companySuggestions = q ? this.callerService.instrumentFuzzySearch(q) : [];
    return this.companySuggestions;
  }

  onDeactivate() {
    window.scrollTo(0, 0);
  }

  openGroup(group: string) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
          'name': group
      }
    };
    this.router.navigate(['group'], navigationExtras);
  }
}
