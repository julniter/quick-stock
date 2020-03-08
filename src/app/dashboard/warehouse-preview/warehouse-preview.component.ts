import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { WarehouseListDataSource, WarehouseListItem } from '../../setup/warehouse-list/warehouse-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warehouse-preview',
  templateUrl: './warehouse-preview.component.html',
  styleUrls: ['./warehouse-preview.component.css']
})
export class WarehousePreviewComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<WarehouseListItem>;
  dataSource: WarehouseListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'city', 'province'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: WarehousesService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new WarehouseListDataSource(this.$db.topFive().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  viewMore() {
    this.router.navigate(['setup', 'warehouses']);
  }
}
