import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { JobOrderListDataSource, JobOrderListItem, JobOrderStatus } from './job-order-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { JobOrdersService } from 'src/app/sales-job-orders.service';
import { PageMode } from 'src/app/firebase.meta';
import {MatDialog} from '@angular/material/dialog';
import { InventoryService } from 'src/app/inventory.service';
import * as firebase from 'firebase';
import { ProcessDialogComponent } from 'src/app/shared/process-dialog/process-dialog.component';
import { CancelDialogComponent } from 'src/app/shared/components/cancel-dialog/cancel-dialog.component';
import { ReceiveDialogComponent } from 'src/app/shared/receive-dialog/receive-dialog.component';
import { DeliverDialogComponent } from 'src/app/shared/deliver-dialog/deliver-dialog.component';

@Component({
  selector: 'app-job-order-list',
  templateUrl: './job-order-list.component.html',
  styleUrls: ['./job-order-list.component.css']
})
export class JobOrderListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<JobOrderListItem>;
  dataSource: JobOrderListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['referenceNumber', 'warehouse', 'type', 'status', 'createdAt', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(
    private $db: JobOrdersService,
    private spinner: SpinnerService,
    private router: Router,
    public dialog: MatDialog,
    private $dbInventory: InventoryService) {}

  ngOnInit() {
    this.dataSource = new JobOrderListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(jobOrderListItem: JobOrderListItem) {
    this.router.navigate(
      [
        'sales/job-orders/',
        jobOrderListItem.jobOrder.referenceNumber,
        'details'
      ],
      { state: {item: jobOrderListItem, pageMode: PageMode.View}
    });
  }

  edit(jobOrderListItem: JobOrderListItem) {
    this.router.navigate(
      [
        'sales/job-orders/',
        jobOrderListItem.jobOrder.referenceNumber,
        'details'
      ],
      { state: {item: jobOrderListItem, pageMode: PageMode.Edit}
    });
  }

  copy(jobOrderListItem: JobOrderListItem) {
    this.router.navigate(
      [
        'sales/job-orders/',
        jobOrderListItem.jobOrder.referenceNumber,
        'details'
      ],
      { state: {item: jobOrderListItem, pageMode: PageMode.Copy}
    });
  }

  process(jobOrderListItem: JobOrderListItem) {
    const dialogRef = this.dialog.open(
      ProcessDialogComponent, {
        maxWidth: 300,
        data: {
          header: 'Job Orders',
          message: 'order with reference '
          + jobOrderListItem.jobOrder.referenceNumber
          + ', to be stored in warehouse(' + jobOrderListItem.warehouse.warehouse.name + ')'
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
      .ref()
      .doc(jobOrderListItem.id)
      .update({status: JobOrderStatus.InProgress })
      .then(res => {})
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide();
      });
    });
  }

  receive(jobOrderListItem: JobOrderListItem) {
    const dialogRef = this.dialog.open(
      ReceiveDialogComponent, {
        width: '80%',
        data: { jobOrderListItem }
      },
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
      .ref()
      .doc(jobOrderListItem.id)
      .update({status: JobOrderStatus.Received })
      .then(res => {})
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide();
      });
    });
  }

  deliver(jobOrderListItem: JobOrderListItem) {
    const dialogRef = this.dialog.open(
      DeliverDialogComponent, {
        width: '80%',
        data: { jobOrderListItem }
      },
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
      .ref()
      .doc(jobOrderListItem.id)
      .update({status: JobOrderStatus.Delivered })
      .then(res => {})
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide();
      });
    });
  }

  cancel(jobOrderListItem: JobOrderListItem) {
    const dialogRef = this.dialog.open(
      CancelDialogComponent, {
        maxWidth: 300,
        data: {
          header: 'Job Orders',
          message: 'order with reference ' + jobOrderListItem.jobOrder.referenceNumber
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
      .ref()
      .doc(jobOrderListItem.id)
      .update({status: JobOrderStatus.Cancelled })
      .then(res => {})
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide();
      });
    });
  }

}
