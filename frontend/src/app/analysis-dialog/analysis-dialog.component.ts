import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-analysis-dialog',
  templateUrl: './analysis-dialog.component.html',
  styleUrls: ['./analysis-dialog.component.css']
})
export class AnalysisDialogComponent implements OnInit {

    public factors: any[];

    constructor(
        public dialogRef: MatDialogRef<AnalysisDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data: any) {
            this.factors = data;
        }

  close(): void {
    this.dialogRef.close(this.factors);
  }

  ngOnInit() {}

}
