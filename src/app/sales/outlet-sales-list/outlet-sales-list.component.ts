import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletSalesListDataSource, OutletSalesListItem } from './outlet-sales-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { OutletSalesService } from 'src/app/sales-outlet-sales.service';
import { PageMode } from 'src/app/firebase.meta';

@Component({
  selector: 'app-outlet-sales-list',
  templateUrl: './outlet-sales-list.component.html',
  styleUrls: ['./outlet-sales-list.component.css']
})
export class OutletSalesListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<OutletSalesListItem>;
  dataSource: OutletSalesListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'status', 'createdAt', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: OutletSalesService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new OutletSalesListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  // view(outletSalesItem: OutletSalesListItem) {
  //   this.router.navigate(
  //     [
  //       'setup/outlets/',
  //       outletSalesItem.outletInventorySnapshot.outlet.outlet.name,
  //       'details'
  //     ],
  //     { state: {item: outletSalesItem, pageMode: PageMode.Edit}
  //   });
  // }

  // copy(outletSalesItem: OutletSalesListItem) {
  //   this.router.navigate(
  //     [
  //       'setup/outlets/',
  //       outletSalesItem.outletInventorySnapshot.outlet.outlet.name,
  //       'copy'
  //     ],
  //     { state: {item: outletSalesItem, pageMode: PageMode.Copy}
  //   });
  // }
}
