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

  constructor(private accountsService: AccountsService, private router: Router) { }

  onSubmit() {
    this.accountsService.login(this.username, this.password);
    this.router.navigate(['home']);
  }

}
