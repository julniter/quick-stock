import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletSummaryDataSource } from './outlet-summary-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { OutletsService } from 'src/app/setup-outlets.service';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';

@Component({
  selector: 'app-outlet-summary',
  templateUrl: './outlet-summary.component.html',
  styleUrls: ['./outlet-summary.component.css']
})
export class OutletSummaryComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<OutletListItem>;
  dataSource: OutletSummaryDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['#', 'name', 'city', 'province'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: OutletsService, private spinner: SpinnerService) {}

  ngOnInit() {
    this.dataSource = new OutletSummaryDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
