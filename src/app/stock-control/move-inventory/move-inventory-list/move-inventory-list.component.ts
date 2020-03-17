import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MoveInventoryListDataSource } from './move-inventory-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { InventoryService } from 'src/app/inventory.service';
import { MoveInventorySnapshot, MoveInventorySnapshotType, MoveInventorySnapshotStatus } from 'src/app/inventory.model';
import { PageMode } from 'src/app/firebase.meta';
import { MatDialog } from '@angular/material';
import * as firebase from 'firebase';
import { CancelDialogComponent } from 'src/app/shared/components/cancel-dialog/cancel-dialog.component';
import { ProcessDialogComponent } from 'src/app/shared/process-dialog/process-dialog.component';
import { ReceiveDialogComponent } from 'src/app/shared/receive-dialog/receive-dialog.component';
import { ReceiveMovedDialogComponent } from 'src/app/shared/receive-moved-dialog/receive-moved-dialog.component';

@Component({
  selector: 'app-move-inventory-list',
  templateUrl: './move-inventory-list.component.html',
  styleUrls: ['./move-inventory-list.component.css']
})
export class MoveInventoryListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<MoveInventorySnapshot>;
  dataSource: MoveInventoryListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['date', 'source', 'destination', 'type', 'status', 'actions'];
  destroy$: Subject<void> = new Subject();

  @Input() moveInventoryType: MoveInventorySnapshotType;

  constructor(
    private $db: InventoryService,
    private spinner: SpinnerService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource = new MoveInventoryListDataSource(
      this.$db.moveInventory(this.moveInventoryType).valueChanges(),
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

  private getUrl() {
    switch(this.moveInventoryType) {
      case MoveInventorySnapshotType.OutletToWarehouse:
        return 'outlet-to-warehouse';
      case MoveInventorySnapshotType.OutletToOutlet:
        return 'outlet-to-outlet';
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return 'warehouse-to-outlet';
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return 'warehouse-to-warehouse';
    }
  }

  private getSourceDestination(row: MoveInventorySnapshot) {
    switch (this.moveInventoryType) {
      case MoveInventorySnapshotType.OutletToWarehouse:
        return row.source['outlet'].name + ' & ' + row.destination['warehouse'].name;
      case MoveInventorySnapshotType.OutletToOutlet:
        return row.source['outlet'].name + ' & ' + row.destination['outlet'].name;
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return row.source['warehouse'].name + ' & ' + row.destination['outlet'].name;
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return row.source['warehouse'].name + ' & ' + row.destination['warehouse'].name;
    }
  }

  newUpdate() {
    this.router.navigate(['stock-control', 'move-inventory', this.getUrl(), 'new'])
  }

  view(row: MoveInventorySnapshot) {
    this.router.navigate(
      ['stock-control', 'move-inventory', this.getUrl(), row.id, 'details'],
      { state: {item: row, pageMode: PageMode.View} }
    );
  }

  process(row: MoveInventorySnapshot) {
    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
    };

    const dialogRef = this.dialog.open(
      ProcessDialogComponent, {
        data: {
          header: 'Move Inventory',
          message: 'inventory movement from ' + this.getSourceDestination(row)
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
        .moveInventory(row.type)
        .doc(row.id)
        .update({status: MoveInventorySnapshotStatus.InProgress})
        .catch(errorFn)
        .finally(finallyFn);
    });
  }

  receive(row: MoveInventorySnapshot) {
    const dialogRef = this.dialog.open(
      ReceiveMovedDialogComponent, {
        width: '80%',
        data: { moveInventorySnapshot: row }
      },
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db.moveInventory(row.type)
      .doc(row.id)
      .update({status: MoveInventorySnapshotStatus.Received })
      .then(res => {})
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide();
      });
    });
  }

  cancel(row: MoveInventorySnapshot) {
    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
    };

    const dialogRef = this.dialog.open(
      CancelDialogComponent, {
        data: {
          header: 'Move Inventory',
          message: 'inventory movement from ' + this.getSourceDestination(row)
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
        .moveInventory(row.type)
        .doc(row.id)
        .update({status: MoveInventorySnapshotStatus.Cancelled})
        .catch(errorFn)
        .finally(finallyFn);
    });
  }

}
