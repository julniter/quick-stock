import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletInventoryListDataSource } from './outlet-inventory-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { InventoryService } from 'src/app/inventory.service';
import { OutletInventorySnapshot, InventorySnapshotStatus } from 'src/app/inventory.model';
import { PageMode } from 'src/app/firebase.meta';
import { VerifyDialogComponent } from 'src/app/shared/components/verify-dialog/verify-dialog.component';
import { MatDialog } from '@angular/material';
import { RejectDialogComponent } from 'src/app/shared/components/reject-dialog/reject-dialog.component';
import * as firebase from 'firebase';

@Component({
  selector: 'app-outlet-inventory-list',
  templateUrl: './outlet-inventory-list.component.html',
  styleUrls: ['./outlet-inventory-list.component.css']
})
export class OutletInventoryListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<OutletInventorySnapshot>;
  dataSource: OutletInventoryListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['date', 'outlet', 'status', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(
    private $db: InventoryService,
    private spinner: SpinnerService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource = new OutletInventoryListDataSource(this.$db.outletInventoryUpdate.valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(outletInventorySnapshot: OutletInventorySnapshot) {
    this.router.navigate(
      ['stock-control', 'count-inventory', 'outlet', outletInventorySnapshot.outlet.outlet.name, 'details'],
      { state: {item: outletInventorySnapshot, pageMode: PageMode.View} }
    );
  }

  approve(outletInventorySnapshot: OutletInventorySnapshot) {
    const errorFn = error => {
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
    };

    const dialogRef = this.dialog.open(
      VerifyDialogComponent, {
        data: {
          header: 'Outlet Inventory',
          message: 'inventory update for ' + outletInventorySnapshot.outlet.outlet.name
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      const activeInventory = Object.assign(
        {...outletInventorySnapshot},
        {
          id: this.$db.outlet.ref.doc().id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: InventorySnapshotStatus.Approved
        }
      ) as OutletInventorySnapshot;

      Promise.all([
        this.$db.outletInventoryUpdate
        .doc(outletInventorySnapshot.id)
        .update({status: InventorySnapshotStatus.Approved}),
        this.$db.saveOutlet(activeInventory)
      ])
      .catch(errorFn)
      .finally(finallyFn);
    });
  }

  reject(outletInventorySnapshot: OutletInventorySnapshot) {
    const errorFn = error => {
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
    };

    const dialogRef = this.dialog.open(
      RejectDialogComponent, {
        data: {
          header: 'Outlet Inventory',
          message: 'inventory update for ' + outletInventorySnapshot.outlet.outlet.name
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
        .outletInventoryUpdate
        .doc(outletInventorySnapshot.id)
        .update({status: InventorySnapshotStatus.Rejected})
        .catch(errorFn)
        .finally(finallyFn);
    });
  }

}
