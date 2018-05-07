import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';
import { HomeComponent } from '../home/home.component';
import { SearchComponent } from '../search/search.component';
import { AnalysisComponent } from '../analysis/analysis.component';
import { AboutComponent } from '../about/about.component';

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
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'group',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
