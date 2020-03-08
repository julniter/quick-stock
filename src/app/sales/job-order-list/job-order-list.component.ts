import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { JobOrderListDataSource, JobOrderListItem, JobOrderStatus, getJobOrderStatus } from './job-order-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { PageMode } from 'src/app/firebase.meta';
import { JobOrdersService } from 'src/app/sales-job-orders.service';

@Component({
  selector: 'app-job-order-list',
  templateUrl: './job-order-list.component.html',
  styleUrls: ['./job-order-list.component.css']
})
export class JobOrderListComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<JobOrderListItem>;
  dataSource: JobOrderListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'referenceNumber', 'supplier', 'product', 'warehouse', 'type', 'status', 'actions'];
  destroy$: Subject<void> = new Subject();

  jobOrderStatus: any;

  constructor(
    private $db: JobOrdersService,
    private spinner: SpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.jobOrderStatus = JobOrderStatus;

    this.dataSource = new JobOrderListDataSource(
      this.$db.ref().valueChanges(),
      this.spinner
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  edit(jobOrderItem: JobOrderListItem) {
    this.router.navigate(
      ['sales/job-orders/', jobOrderItem.id, 'details'],
      { state: { item: jobOrderItem, pageMode: PageMode.Edit } }
    );
  }

  view(jobOrderItem: JobOrderListItem) {
    this.router.navigate(
      ['sales/job-orders/', jobOrderItem.id, 'details'],
      { state: { item: jobOrderItem, pageMode: PageMode.View } }
    );
  }

  copy(jobOrderItem: JobOrderListItem) {
    this.router.navigate(
      ['sales/job-orders/', jobOrderItem.id, 'copy'],
      { state: { item: jobOrderItem, pageMode: PageMode.Copy } }
    );
  }
}
