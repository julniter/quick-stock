import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { WarehouseInventoryListDataSource } from './warehouse-inventory-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { InventoryService } from 'src/app/inventory.service';
import { WarehouseInventorySnapshot, InventorySnapshotStatus } from 'src/app/inventory.model';
import { PageMode } from 'src/app/firebase.meta';
import { VerifyDialogComponent } from 'src/app/shared/components/verify-dialog/verify-dialog.component';
import { MatDialog } from '@angular/material';
import { RejectDialogComponent } from 'src/app/shared/components/reject-dialog/reject-dialog.component';
import * as firebase from 'firebase';

@Component({
  selector: 'app-warehouse-inventory-list',
  templateUrl: './warehouse-inventory-list.component.html',
  styleUrls: ['./warehouse-inventory-list.component.css']
})
export class WarehouseInventoryListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<WarehouseInventorySnapshot>;
  dataSource: WarehouseInventoryListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['date', 'warehouse', 'status', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(
    private $db: InventoryService,
    private spinner: SpinnerService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource = new WarehouseInventoryListDataSource(this.$db.warehouseInventoryUpdate.valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(warehouseInventorySnapshot: WarehouseInventorySnapshot) {
    this.router.navigate(
      ['stock-control', 'count-inventory', 'warehouse', warehouseInventorySnapshot.warehouse.warehouse.name, 'details'],
      { state: {item: warehouseInventorySnapshot, pageMode: PageMode.View} }
    );
  }

  approve(warehouseInventorySnapshot: WarehouseInventorySnapshot) {
    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
    };

    const dialogRef = this.dialog.open(
      VerifyDialogComponent, {
        data: {
          header: 'Warehouse Inventory',
          message: 'inventory update for ' + warehouseInventorySnapshot.warehouse.warehouse.name
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      const activeInventory = Object.assign(
        {...warehouseInventorySnapshot},
        {
          id: this.$db.warehouse.ref.doc().id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: InventorySnapshotStatus.Approved
        }
      ) as WarehouseInventorySnapshot;

      Promise.all([
        this.$db.warehouseInventoryUpdate
        .doc(warehouseInventorySnapshot.id)
        .update({status: InventorySnapshotStatus.Approved}),
        this.$db.saveWarehouse(activeInventory)
      ])
      .catch(errorFn)
      .finally(finallyFn);
    });
  }

  reject(warehouseInventorySnapshot: WarehouseInventorySnapshot) {
    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
    };

    const dialogRef = this.dialog.open(
      RejectDialogComponent, {
        data: {
          header: 'Warehouse Inventory',
          message: 'inventory update for ' + warehouseInventorySnapshot.warehouse.warehouse.name
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
        .warehouseInventoryUpdate
        .doc(warehouseInventorySnapshot.id)
        .update({status: InventorySnapshotStatus.Rejected})
        .catch(errorFn)
        .finally(finallyFn);
    });
  }

}
