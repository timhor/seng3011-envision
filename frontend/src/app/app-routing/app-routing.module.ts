import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';
import { HomeComponent } from '../home/home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AppComponent
  },
  {
    path: 'home',
    component: HomeComponent
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
