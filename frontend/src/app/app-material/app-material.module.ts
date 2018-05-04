import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatSidenavModule,
  MatDividerModule,
  MatInputModule,
  MatListModule,
  MatAutocompleteModule,
  MatGridListModule,
  MatExpansionModule
} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatInputModule,
    MatListModule,
    MatAutocompleteModule,
    MatGridListModule,
    MatExpansionModule
  ],
  exports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatInputModule,
    MatListModule,
    MatAutocompleteModule,
    MatGridListModule,
    MatExpansionModule
  ]
})
export class AppMaterialModule { }
