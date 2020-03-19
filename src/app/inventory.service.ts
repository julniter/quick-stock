import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { InventorySnopshot, ProductInventoryItem, InventoryProductVariations,
  OutletInventorySnapshot, WarehouseInventorySnapshot, MoveInventorySnapshotType } from './inventory.model';
import { ProductListItem } from './products/product-list/product-list-datasource';
import { SummaryReportDateRange } from './shared/pdf-reports.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private afStore: AngularFirestore) {}

  moveInventory(moveInventorySnapshotType: MoveInventorySnapshotType) {
    switch (moveInventorySnapshotType) {
      case MoveInventorySnapshotType.OutletToOutlet:
        return this.afStore.collection('inventory-move-outlet-to-outlet');
      case MoveInventorySnapshotType.OutletToWarehouse:
        return this.afStore.collection('inventory-move-outlet-to-warehouse');
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return this.afStore.collection('inventory-move-warehouse-to-outlet');
      case MoveInventorySnapshotType.WarehouseToWarehouse:
        return this.afStore.collection('inventory-move-warehouse-to-warehouse');
      default:
        return this.afStore.collection('inventory-move-outlet-to-outlet');
    }
  }

  get outlet() {
    return this.afStore.collection('inventory-outlet');
  }

  get outletInventoryUpdate() {
    return this.afStore.collection('inventory-outlet-updates');
  }

  deactivateOutletSnapshot(id: string) {
    return this.getLatestOutletSnapshot(id).then(res => {
      return res.docs.map(d => {
        return d.ref.update({isActive: false});
      });
    });
  }

  saveOutlet(snapshot: OutletInventorySnapshot) {
    return this.deactivateOutletSnapshot(snapshot.outlet.id)
    .then(res => {
      return Promise.all(res).then(res => {
        return this.afStore.collection('inventory-outlet')
        .doc(snapshot.id)
        .set(snapshot)
        .then((r) => {
          return r;
        })
        .catch(error => {
          console.error(error);
          return error;
        });
      })
      .catch(error => {
        console.error(error);
        return error;
      });
    })
    .catch(error => {
      console.error(error);
      return error;
    });
  }

  getLatestOutletSnapshot(id: string) {
    return this.afStore
    .collection('inventory-outlet').ref
    .where('outlet.id', '==', id)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc').limit(1).get();
  }

  getMultiLatestOutletSnapshot(ids: string[]) {
    return this.afStore
    .collection('inventory-outlet').ref
    .where('outlet.id', 'in', ids)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc');
  }

  getOutletSnapshots(id: string) {
    return this.afStore
    .collection('inventory-outlet').ref
    .where('outlet.id', '==', id)
    .orderBy('createdAt', 'desc').get();
  }

  getOutletSnapshotsByDateRange(id: string, dateRange: SummaryReportDateRange) {
    return this.afStore
    .collection('inventory-outlet').ref
    .where('outlet.id', '==', id)
    .where(
      'createdAt',
      '>=',
      dateRange.fromDate
    )
    .where(
      'createdAt',
      '<=',
      dateRange.toDate
      )
    .orderBy('createdAt', 'desc').get();
  }

  getOutletSnapshotsByDate(id: string, date: Date) {
    return this.afStore
    .collection('inventory-outlet').ref
    .limit(1)
    .where('outlet.id', '==', id)
    .where('createdAt', '<', date)
    .orderBy('createdAt', 'desc')
    .get();
  }

  queryProductFromOutletSnapshots(productId: string) {
    return this.afStore
    .collection('inventory-outlet').ref
    .where('isActive', '==', true)
    .where('productIds', 'array-contains', productId).get();
  }

  get warehouse() {
    return this.afStore.collection('inventory-warehouse');
  }

  get warehouseInventoryUpdate() {
    return this.afStore.collection('inventory-warehouse-updates');
  }

  deactivateWarehouseSnapshot(id: string) {
    return this.getLatestWarehouseSnapshot(id).then(res => {
      return res.docs.map(d => {
        return d.ref.update({isActive: false});
      });
    });
  }

  saveWarehouse(snapshot: WarehouseInventorySnapshot) {
    return this.deactivateWarehouseSnapshot(snapshot.warehouse.id)
    .then(res => {
      return Promise.all(res).then(res => {
        return this.afStore.collection('inventory-warehouse')
        .doc(snapshot.id)
        .set(snapshot)
        .then((r) => {
          return r;
        })
        .catch(error => {
          console.error(error);
          return error;
        });
      })
      .catch(error => {
        console.error(error);
        return error;
      });
    })
    .catch(error => {
      console.error(error);
      return error;
    });
  }

  getLatestWarehouseSnapshot(id: string) {
    return this.afStore
    .collection('inventory-warehouse').ref
    .where('warehouse.id', '==', id)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc').limit(1).get();
  }

  getMultiLatestWarehouseSnapshot(ids: string[]) {
    return this.afStore
    .collection('inventory-warehouse').ref
    .where('warehouse.id', 'in', ids)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc');
  }

  getWarehouseSnapshots(id: string) {
    return this.afStore
    .collection('inventory-warehouse').ref
    .where('warehouse.id', '==', id)
    .orderBy('createdAt', 'desc').get();
  }

  getWarehouseSnapshotsByDateRange(id: string, dateRange: SummaryReportDateRange) {
    return this.afStore
    .collection('inventory-warehouse').ref
    .where('warehouse.id', '==', id)
    .where(
      'createdAt',
      '>=',
      dateRange.fromDate
    )
    .where(
      'createdAt',
      '<=',
      dateRange.toDate
      )
    .orderBy('createdAt', 'desc').get();
  }

  getWarehouseSnapshotsByDate(id: string, date: Date) {
    return this.afStore
    .collection('inventory-warehouse').ref
    .limit(1)
    .where('warehouse.id', '==', id)
    .where('createdAt', '<', date)
    .orderBy('createdAt', 'desc')
    .get();
  }

  queryProductFromWarehouseSnapshots(productId: string) {
    return this.afStore
    .collection('inventory-warehouse').ref
    .where('isActive', '==', true)
    .where('productIds', 'array-contains', productId).get();
  }

  updateSnapshotAddProduct(target: InventorySnopshot, source: ProductInventoryItem[], products: ProductListItem[]) {
    target.productInventory = target.productInventory.map((p: ProductInventoryItem) => {

      const sourceProduct = products.find(sp => sp.id === p.id);
      const sourceIndex = products.indexOf(sourceProduct);

      if (sourceProduct !== undefined) {
        p.productVariations = p.productVariations.map((pv: InventoryProductVariations, index) => {

          pv.count = +pv.count + +source[sourceIndex].productVariations[index].count;

          return pv;
        });
      }

      return p;
    });

    const newProducts = products.filter(s => (target.productInventory.find(p => p.id === s.id) === undefined));
    newProducts.map(np => {
      target.productInventory.push({...source[products.indexOf(np)], ...np});
    });

    return target;
  }

  updateSnapshotLessProduct(target: InventorySnopshot, source: ProductInventoryItem[], products: ProductListItem[]) {
    target.productInventory = target.productInventory.map((p: ProductInventoryItem) => {

      const sourceProduct = products.find(sp => sp.id === p.id);
      const sourceIndex = products.indexOf(sourceProduct);

      if (sourceProduct !== undefined) {
        p.productVariations = p.productVariations.map((pv: InventoryProductVariations, index) => {

          pv.count = +pv.count - +source[sourceIndex].productVariations[index].count;

          return pv;
        });
      }

      return p;
    });

    return target;
  }

}
