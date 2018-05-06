import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';
import { HomeComponent } from '../home/home.component';
import { SearchComponent } from '../search/search.component';
import { AnalysisComponent } from '../analysis/analysis.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'home',
    pathMatch: 'full',
    redirectTo: '/'
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'analysis',
    component: AnalysisComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
