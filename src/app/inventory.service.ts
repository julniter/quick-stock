import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { InventorySnopshot, ProductInventoryItem, InventoryProductVariations,
  OutletInventorySnapshot, WarehouseInventorySnapshot } from './inventory.model';
import { ProductListItem } from './products/product-list/product-list-datasource';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private afStore: AngularFirestore) {}

  get outlet() {
    return this.afStore.collection('inventory-outlet');
  }

  saveOutlet(snapshot: OutletInventorySnapshot) {
    const response = new Promise((resolve, reject) => {
      this.afStore.collection(
        'inventory-outlet',
        ref => ref
        .where('outlet.id', '==', snapshot.outlet.id)
        .where('isActive', '==', true)
      )
      .doc()
      .update({isActive: false})
      .then((res) => {
        return this.afStore.collection('inventory-outlet')
        .doc(snapshot.id)
        .set(snapshot)
        .finally(() => {
          resolve(snapshot);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
    });

    return response;
  }

  outletSnapshot(id: string) {
    return this.afStore.collection('inventory-outlet').doc(id).collection('snapshot');
  }

  getLatestOutletSnapshot(id: string) {
    return this.afStore.collection('inventory-outlet').doc(id).collection('snapshot').ref.orderBy('createdAt', 'desc').limit(1).get();
  }

  getOutletSnapshots(id: string) {
    return this.afStore.collection('inventory-outlet').doc(id).collection('snapshot').ref.orderBy('createdAt', 'desc').get();
  }

  queryProductFromOutletSnapshots(productId: string) {
    return this.afStore.collection('inventory-outlet', ref => ref.where('productIds', 'array-contains', productId));
  }

  get warehouse() {
    return this.afStore.collection('inventory-warehouse');
  }

  saveWarehouse(snapshot: WarehouseInventorySnapshot) {
    const response = new Promise((resolve, reject) => {
      this.afStore.collection(
        'inventory-warehouse',
        ref => ref
        .where('warehouse.id', '==', snapshot.warehouse.id)
        .where('isActive', '==', true)
      )
      .doc()
      .update({isActive: false})
      .then((res) => {
        return this.afStore.collection('inventory-warehouse')
        .doc(snapshot.id)
        .set(snapshot)
        .finally(() => {
          resolve(snapshot);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
    });

    return response;
  }

  warehouseSnapshot(id: string) {
    return this.afStore.collection('inventory-warehouse').doc(id).collection('snapshot');
  }

  getLatestWarehouseSnapshot(id: string) {
    return this.afStore.collection('inventory-warehouse').doc(id).collection('snapshot').ref.orderBy('createdAt', 'desc').limit(1).get();
  }

  getWarehouseSnapshots(id: string) {
    return this.afStore.collection('inventory-warehouse').doc(id).collection('snapshot').ref.orderBy('createdAt', 'desc').get();
  }

  queryProductFromWarehouseSnapshots(productId: string) {
    return this.afStore.collection('inventory-warehouse', ref => ref.where('productIds', 'array-contains', productId));
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
