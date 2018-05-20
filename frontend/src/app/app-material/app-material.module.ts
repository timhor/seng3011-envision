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
  MatChipsModule,
  MatRadioModule,
  MatTooltipModule
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
    MatChipsModule,
    MatRadioModule,
    MatTooltipModule
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
    MatChipsModule,
    MatRadioModule,
    MatTooltipModule
  ]
})
export class AppMaterialModule { }
