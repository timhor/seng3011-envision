import { Injectable } from '@angular/core';
import { AccountInfo } from './accountInfo';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

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


  private subjects: Subject<any>[] = [];

  publish(eventName: string) {
    // ensure a subject for the event name exists
    this.subjects[eventName] = this.subjects[eventName] || new Subject();

    // publish event
    this.subjects[eventName].next();
  }

  on(eventName: string): Observable<any> {
    // ensure a subject for the event name exists
    this.subjects[eventName] = this.subjects[eventName] || new Subject();

    // return observable
    return this.subjects[eventName].asObservable();
  }

  public addAccount(account: AccountInfo) {
    if (!account.username || !account.email || !account.password || !account.password_2 ||
      (account.password !== account.password_2)) {
        return false;
      }
      if (!this.accounts.find(x => x.username === account.username)) {
        this.accounts.push(account);
        return true;
      } else {
        return false;
      }
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
