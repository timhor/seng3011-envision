import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent implements OnInit {

    public title: string;
    public displayString: string;

    constructor(
        public dialogRef: MatDialogRef<DialogBoxComponent>,
        @Inject(MAT_DIALOG_DATA) data) {
            this.title = data.title;
            this.displayString = data.help;
        }

    ngOnInit() {}

    close(): void {
        this.dialogRef.close();
    }

}
