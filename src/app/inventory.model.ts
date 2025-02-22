import { FirebaseMetaData } from './firebase.meta';
import { ProductVariation, ProductListItem } from './products/product-list/product-list-datasource';
import { Outlet, OutletListItem } from './setup/outlet-list/outlet-list-datasource';
import { Warehouse, WarehouseListItem } from './setup/warehouse-list/warehouse-list-datasource';

export enum InventorySnapshotStatus {
  Pending,
  Approved,
  Rejected
}

export enum MoveInventorySnapshotStatus {
  Pending,
  InProgress,
  Received,
  Cancelled
}

export enum MoveInventorySnapshotType {
  OutletToWarehouse,
  OutletToOutlet,
  WarehouseToOutlet,
  WarehouseToWarehouse
}

export interface MoveInventorySnapshot extends FirebaseMetaData {
  source: OutletListItem | WarehouseListItem;
  destination: OutletListItem | WarehouseListItem;
  productVariations: ProductInventoryItem[];
  selectedProducts: ProductListItem[];
  status: MoveInventorySnapshotStatus;
  type: MoveInventorySnapshotType;
}

export interface LocationInventorySnapshot extends FirebaseMetaData {
  location?: Outlet | Warehouse;
  snapshot: InventorySnopshot;
  productIds: string[];
  status?: InventorySnapshotStatus | MoveInventorySnapshotStatus;
}

export interface OutletInventorySnapshot extends LocationInventorySnapshot {
  outlet: OutletListItem;
}

export interface WarehouseInventorySnapshot extends LocationInventorySnapshot {
  warehouse: WarehouseListItem;
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
