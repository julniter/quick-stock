import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { WarehouseSummaryDataSource } from './warehouse-summary-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';

@Component({
  selector: 'app-warehouse-summary',
  templateUrl: './warehouse-summary.component.html',
  styleUrls: ['./warehouse-summary.component.css']
})
export class WarehouseSummaryComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<WarehouseListItem>;
  dataSource: WarehouseSummaryDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['#', 'name', 'city', 'province'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: WarehousesService, private spinner: SpinnerService) {}

  ngOnInit() {
    this.dataSource = new WarehouseSummaryDataSource(this.$db.ref().valueChanges(), this.spinner);
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
