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
  MatTooltipModule,
  MatDialogModule,
  MatCheckboxModule
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
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule
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
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule
  ]
})
export class AppMaterialModule { }
