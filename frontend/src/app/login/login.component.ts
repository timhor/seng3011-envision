import { Component } from '@angular/core';
import { AccountsService } from '../accounts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public username: string;
  public password: string;
  public error: string;

  constructor(private accountsService: AccountsService, private router: Router) { }

  onSubmit() {
    if (this.accountsService.login(this.username, this.password)) {
      this.accountsService.publish('call-parent');
      this.router.navigate(['dashboard']);
    } else {
      this.error = 'Incorrect Username or Password!';
    }
  }

}
