import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { InventorySnopshot, ProductInventoryItem, InventoryProductVariations } from './inventory.model';
import { ProductListItem } from './products/product-list/product-list-datasource';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private afStore: AngularFirestore) {}

  outlet() {
    return this.afStore.collection('inventory-outlet');
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

  warehouse() {
    return this.afStore.collection('inventory-warehouse');
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
