import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-process-dialog',
  templateUrl: './process-dialog.component.html',
  styleUrls: ['./process-dialog.component.css']
})
export class ProcessDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProcessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {header: string, message: string} ) {}

  ngOnInit(): void { }

}
