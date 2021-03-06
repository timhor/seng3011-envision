import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppMaterialModule } from './app-material/app-material.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';

import { CallerService } from './caller.service';

import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { ChartModule } from 'angular2-chartjs';

import { AnalysisComponent } from './analysis/analysis.component';
import { AboutComponent } from './about/about.component';

import 'hammerjs';
import 'chartjs-plugin-zoom';
import { AnalysisDialogComponent } from './analysis-dialog/analysis-dialog.component';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';

import { SimilarityGraphComponent } from './similarity-graph/similarity-graph.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AccountsService } from './accounts.service';
import { AccountInfo } from './accountInfo';
import { DashboardComponent } from './dashboard/dashboard.component';

export const serviceProviders = [
  CallerService
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    AnalysisComponent,
    AboutComponent,
    SimilarityGraphComponent,
    AnalysisDialogComponent,
    DialogBoxComponent,
    SignupComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppMaterialModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    Ng2FlatpickrModule,
    ChartModule
  ],
  providers: [
      CallerService,
      serviceProviders,
      AccountsService
  ],
  entryComponents: [
    AnalysisDialogComponent,
    DialogBoxComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {}
