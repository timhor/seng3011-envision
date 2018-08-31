import { Component } from '@angular/core';
import { Company } from '../company';
import { CallerService } from '../caller.service';
import { AccountInfo } from '../accountInfo';
import { AccountsService } from '../accounts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  public accountDetails: AccountInfo = {
    'username': '',
    'email': '',
    'password': '',
    'password_2': '',
    'company_list': []
  };
  public query: string;
  public error: string;
  private companySuggestions: Company[] = [];

  constructor(private callerService: CallerService, private accountsService: AccountsService, private router: Router) {}

  onSubmit() {
    console.log(this.accountDetails);
    if (this.accountsService.addAccount(this.accountDetails)) {
      this.error = null;
      this.router.navigate(['login']);
    } else {
      this.error = 'Invalid registration';
    }
  }

  updateList() {
    console.log(this.query);
    if (!this.accountDetails.company_list.includes(this.query)) {
      this.accountDetails.company_list.push(this.query);
    }
    console.log(this.accountDetails);
  }

  remove(index: number) {
    this.accountDetails.company_list.splice(index, 1);
  }

  updateAutocomplete(q: string) {
    q = q.replace(/\..*/, '');
    q = q.replace(/.*\:/, '');
    this.companySuggestions = q ? this.callerService.instrumentFuzzySearch(q) : [];
    return this.companySuggestions;
  }

}
