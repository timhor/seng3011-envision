export class AccountInfo {
    constructor (
      public username: string,
      public email: string,
      public password: string,
      public password_2: string,
      public company_list: string[]
    ) { }
  }
