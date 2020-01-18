import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { WarehouseListDataSource, WarehouseListItem } from './warehouse-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { WarehousesService } from 'src/app/setup-warehouses.services';
import { PageMode } from 'src/app/firebase.meta';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css']
})
export class WarehouseListComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<WarehouseListItem>;
  dataSource: WarehouseListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'city', 'province', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(
    private $db: WarehousesService,
    private spinner: SpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.dataSource = new WarehouseListDataSource(
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

  view(warehouseItem: WarehouseListItem) {
    this.router.navigate(
      ['setup/warehouses/', warehouseItem.warehouse.name, 'details'],
      { state: { item: warehouseItem, pageMode: PageMode.Edit } }
    );
  }

  copy(warehouseItem: WarehouseListItem) {
    this.router.navigate(
      ['setup/warehouses/', warehouseItem.warehouse.name, 'copy'],
      { state: { item: warehouseItem, pageMode: PageMode.Copy } }
    );
  }
}
