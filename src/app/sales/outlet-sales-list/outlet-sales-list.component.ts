import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletSalesListDataSource, OutletSalesListItem, OutletSalesStatus } from './outlet-sales-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { OutletSalesService } from 'src/app/sales-outlet-sales.service';
import { PageMode } from 'src/app/firebase.meta';
import {MatDialog} from '@angular/material/dialog';
import { VerifyDialogComponent } from 'src/app/shared/components/verify-dialog/verify-dialog.component';
import { RejectDialogComponent } from 'src/app/shared/components/reject-dialog/reject-dialog.component';
import { InventoryService } from 'src/app/inventory.service';
import { OutletInventorySnapshot } from 'src/app/inventory.model';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import * as firebase from 'firebase';

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

  constructor(
    private $db: OutletSalesService,
    private spinner: SpinnerService,
    private router: Router,
    public dialog: MatDialog,
    private $dbInventory: InventoryService) {}

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

  view(outletSalesItem: OutletSalesListItem) {
    this.router.navigate(
      [
        'sales/outlet-sales/',
        outletSalesItem.outletInventorySnapshot.outlet.outlet.name,
        'details'
      ],
      { state: {item: outletSalesItem, pageMode: PageMode.View}
    });
  }

  edit(outletSalesItem: OutletSalesListItem) {
    this.router.navigate(
      [
        'sales/outlet-sales/',
        outletSalesItem.outletInventorySnapshot.outlet.outlet.name,
        'details'
      ],
      { state: {item: outletSalesItem, pageMode: PageMode.Edit}
    });
  }

  copy(outletSalesItem: OutletSalesListItem) {
    this.router.navigate(
      [
        'sales/outlet-sales/',
        outletSalesItem.outletInventorySnapshot.outlet.outlet.name,
        'copy'
      ],
      { state: {item: outletSalesItem, pageMode: PageMode.Copy}
    });
  }

  verify(outletSalesItem: OutletSalesListItem) {
    const dialogRef = this.dialog.open(
      VerifyDialogComponent, {
        data: {
          header: 'Outlet Sales',
          message: 'sales for ' + outletSalesItem.outletInventorySnapshot.outlet.outlet.name
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      Promise.all([
        this.$dbInventory
        .getLatestOutletSnapshot(outletSalesItem.outletInventorySnapshot.outlet.id)
        .then(res => {
          if (res.docs.length) {
            return res.docs[0].data();
          } else {
            return null;
          }
        }),
        this.$db
        .ref()
        .doc(outletSalesItem.id)
        .update({status: OutletSalesStatus.Verified})
        .then(res => {
          return true;
        })
      ])
      .then(response => {
        const latestSnapshot = response[0] as OutletInventorySnapshot;
        latestSnapshot.id = this.$dbInventory.outlet.ref.doc().id;
        latestSnapshot.createdAt = firebase.firestore.FieldValue.serverTimestamp(),
        latestSnapshot.snapshot = this.$dbInventory
        .updateSnapshotLessProduct(
          latestSnapshot.snapshot,
          outletSalesItem.outletInventorySnapshot.snapshot.productInventory,
          outletSalesItem.outletInventorySnapshot.snapshot.productInventory as ProductListItem[]
        );

        return this.$dbInventory
        .saveOutlet(latestSnapshot)
        .then(res => {
          return res;
        })
        .catch(err => {
          console.error(err);
        });

      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide();
      });
    });
  }

  reject(outletSalesItem: OutletSalesListItem) {
    const dialogRef = this.dialog.open(
      RejectDialogComponent, {
        data: {
          header: 'Outlet Sales',
          message: 'sales for ' + outletSalesItem.outletInventorySnapshot.outlet.outlet.name
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show();
      this.$db
      .ref()
      .doc(outletSalesItem.id)
      .update({status: OutletSalesStatus.Rejected})
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
