import { Component, ViewChild, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CallerService } from './caller.service';
import { HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';
import { Company } from './company';
import { AccountsService } from './accounts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public company = '';
  private companySuggestions: Company[] = [];
  public groups: string[] = [];
  public isLoggedIn: boolean;
  public subscription;

  public constructor(private callerService: CallerService, private router: Router, private acccountsService: AccountsService) {
    // override the route reuse strategy so that accessing the same page with different params
    // continues to call all the necessary functions (otherwise search page doesn't show results
    // after the first query)
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
    };
    this.isLoggedIn = this.acccountsService.loggedIn();
  }

  @ViewChild('sidenav') sidenav: MatSidenav;
  public navMode = 'side';

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.navMode = 'over';
    }
    this.groups = this.callerService.getGroups();
    this.subscription = this.acccountsService.on('call-parent').subscribe(() => this.updateLoggedIn());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  logout () {
    this.acccountsService.logout();
    this.updateLoggedIn();
    this.router.navigate(['home']);
  }

  updateLoggedIn() {
    this.isLoggedIn = this.acccountsService.loggedIn();
  }
}
