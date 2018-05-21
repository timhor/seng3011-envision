import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public accountDetails: object = {
    'username': '',
    'email': '',
    'password': '',
    'password_2': '',
    'company_list': []
  };
  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.accountDetails);
  }

}
