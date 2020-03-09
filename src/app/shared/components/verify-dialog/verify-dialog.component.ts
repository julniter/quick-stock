import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-verify-dialog',
  templateUrl: './verify-dialog.component.html',
  styleUrls: ['./verify-dialog.component.css']
})
export class VerifyDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<VerifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {header: string, message: string} ) {}

  ngOnInit(): void { }


}
