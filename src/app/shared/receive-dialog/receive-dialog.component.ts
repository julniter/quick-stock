import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { JobOrderListItem } from 'src/app/sales/job-order-list/job-order-list-datasource';

@Component({
  selector: 'app-receive-dialog',
  templateUrl: './receive-dialog.component.html',
  styleUrls: ['./receive-dialog.component.css']
})
export class ReceiveDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ReceiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {jobOrderListItem: JobOrderListItem} ) {}

  ngOnInit(): void { }

}
