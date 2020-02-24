import { FirebaseMetaData } from './firebase.meta';
import { ProductVariation, ProductListItem } from './products/product-list/product-list-datasource';
import { Outlet } from './setup/outlet-list/outlet-list-datasource';
import { Warehouse } from './setup/warehouse-list/warehouse-list-datasource';

export interface OutletInventorySnapshot extends FirebaseMetaData {
  outlet: Outlet;
  snapshot: InventorySnopshot;
}

export interface WarehouseInventorySnapshot extends FirebaseMetaData {
  warehouse: Warehouse;
  snapshot: InventorySnopshot;
}

export interface InventorySnopshot {
  productInventory: ProductInventoryItem[];
}

export interface ProductInventoryItem extends ProductListItem {
  reOrderPoint: number;
  productVariations: InventoryProductVariations[];
}

export interface InventoryProductVariations extends ProductVariation {
  count: number;
}
