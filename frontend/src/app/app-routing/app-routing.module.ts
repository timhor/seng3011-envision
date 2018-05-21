import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';
import { HomeComponent } from '../home/home.component';
import { SearchComponent } from '../search/search.component';
import { AnalysisComponent } from '../analysis/analysis.component';
import { AboutComponent } from '../about/about.component';
import { SimilarityGraphComponent } from '../similarity-graph/similarity-graph.component';
import { SignupComponent } from '../signup/signup.component';

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
  },
  {
    path: 'similarity-graph',
    component: SimilarityGraphComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
