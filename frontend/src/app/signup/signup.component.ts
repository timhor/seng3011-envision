import { Component, OnInit } from '@angular/core';
import { Company } from '../company';
import { CallerService } from '../caller.service';
import { AccountInfo } from '../accountInfo';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public accountDetails: AccountInfo = {
    'username': '',
    'email': '',
    'password': '',
    'password_2': '',
    'company_list': []
  };
  public query: string;
  private companySuggestions: Company[] = [];

  constructor(private callerService: CallerService) {}

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.accountDetails);
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
