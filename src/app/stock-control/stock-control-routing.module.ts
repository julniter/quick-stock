import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockControlComponent } from './stock-control.component';
import { MoveInventoryComponent } from './move-inventory/move-inventory.component';
import { CountInventoryComponent } from './count-inventory/count-inventory.component';
import { InventoryTrackerComponent } from './inventory-tracker/inventory-tracker.component';
import { ProductLookUpComponent } from './product-look-up/product-look-up.component';
import { OutletInventoryFormComponent } from './count-inventory/outlet-inventory-form/outlet-inventory-form.component';
import { WarehouseInventoryFormComponent } from './count-inventory/warehouse-inventory-form/warehouse-inventory-form.component';
import { OutletToWarehouseFormComponent } from './move-inventory/outlet-to-warehouse-form/outlet-to-warehouse-form.component';
import { OutletToOutletFormComponent } from './move-inventory/outlet-to-outlet-form/outlet-to-outlet-form.component';
import { WarehouseToOutletFormComponent } from './move-inventory/warehouse-to-outlet-form/warehouse-to-outlet-form.component';
import { WarehouseToWarehouseFormComponent } from './move-inventory/warehouse-to-warehouse-form/warehouse-to-warehouse-form.component';

const routes: Routes = [
  { path: '', component: StockControlComponent },
  { path: 'count-inventory', component: CountInventoryComponent },
  { path: 'count-inventory/outlet/new', component: OutletInventoryFormComponent },
  { path: 'count-inventory/outlet/:outletName/details', component: OutletInventoryFormComponent },
  { path: 'count-inventory/warehouse/new', component: WarehouseInventoryFormComponent },
  { path: 'count-inventory/warehouse/:warehouseName/details', component: WarehouseInventoryFormComponent },
  { path: 'move-inventory', component: MoveInventoryComponent },
  { path: 'move-inventory/outlet-to-warehouse/new', component: OutletToWarehouseFormComponent },
  { path: 'move-inventory/outlet-to-outlet/new', component: OutletToOutletFormComponent },
  { path: 'move-inventory/warehouse-to-outlet/new', component: WarehouseToOutletFormComponent },
  { path: 'move-inventory/warehouse-to-warehouse/new', component: WarehouseToWarehouseFormComponent },
  { path: 'move-inventory/outlet-to-warehouse/:id/details', component: OutletToWarehouseFormComponent },
  { path: 'move-inventory/outlet-to-outlet/:id/details', component: OutletToOutletFormComponent },
  { path: 'move-inventory/warehouse-to-outlet/:id/details', component: WarehouseToOutletFormComponent },
  { path: 'move-inventory/warehouse-to-warehouse/:id/details', component: WarehouseToWarehouseFormComponent },
  { path: 'track-inventory', component: InventoryTrackerComponent },
  { path: 'product-look-up', component: ProductLookUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockControlRoutingModule { }
