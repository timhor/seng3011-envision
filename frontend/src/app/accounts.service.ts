import { Injectable } from '@angular/core';
import { AccountInfo } from './accountInfo';

@Injectable()
export class AccountsService {
  private accounts: AccountInfo[];
  private isLoggedIn: boolean;
  private loggedInIndex: number;

  constructor() {
    this.accounts = [];
    this.isLoggedIn = false;
    this.loggedInIndex = -1;
   }

  public addAccount(account: AccountInfo) {
    this.accounts.push(account);
  }

  public login(username: string, password: string) {
    if (this.isLoggedIn === true) {
      return;
    }
    let i: number;
    for (i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].username === username && this.accounts[i].password === password) {
        this.isLoggedIn = true;
        this.loggedInIndex = i;
        return true;
      } else {
        return false;
      }
    }
  }

  public logout() {
    this.isLoggedIn = false;
    this.loggedInIndex = -1;
  }

  public getCompanies() {
    return this.accounts[this.loggedInIndex].company_list;
  }

  public loggedIn() {
    return this.isLoggedIn;
  }
}
