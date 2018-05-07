import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  private backendAssetsUrl = 'http://envision-api.ap-southeast-2.elasticbeanstalk.com/static/assets/';
  public teamMembers: Object[] = [
    {
      name: 'Vintony Padmadiredja',
      zID: 'z5113367',
      imageUrl: this.backendAssetsUrl + 'Vintony.jpg'
    },
    {
      name: 'Soham Dinesh Patel',
      zID: 'z5115401',
      imageUrl: this.backendAssetsUrl + 'Soham.jpg'
    },
    {
      name: 'Tim Hor',
      zID: 'z5019242',
      imageUrl: this.backendAssetsUrl + 'Tim.jpg'
    },
    {
      name: 'Michael Tran',
      zID: 'z3461919',
      imageUrl: this.backendAssetsUrl + 'Michael.jpg'
    },
    {
      name: 'James Mangos',
      zID: 'z5109924',
      imageUrl: this.backendAssetsUrl + 'James.jpg'
    },
  ];
}
