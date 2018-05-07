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
  MatExpansionModule,
  MatChipsModule
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
    MatExpansionModule,
    MatChipsModule
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
    MatExpansionModule,
    MatChipsModule
  ]
})
export class AppMaterialModule { }
