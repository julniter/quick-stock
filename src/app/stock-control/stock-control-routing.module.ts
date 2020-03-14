import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockControlComponent } from './stock-control.component';
import { MoveInventoryComponent } from './move-inventory/move-inventory.component';
import { CountInventoryComponent } from './count-inventory/count-inventory.component';
import { InventoryTrackerComponent } from './inventory-tracker/inventory-tracker.component';
import { ProductLookUpComponent } from './product-look-up/product-look-up.component';
import { OutletInventoryFormComponent } from './count-inventory/outlet-inventory-form/outlet-inventory-form.component';
import { WarehouseInventoryFormComponent } from './count-inventory/warehouse-inventory-form/warehouse-inventory-form.component';

const routes: Routes = [
  { path: '', component: StockControlComponent },
  { path: 'count-inventory', component: CountInventoryComponent },
  { path: 'count-inventory/outlet/new', component: OutletInventoryFormComponent },
  { path: 'count-inventory/outlet/:outletName/detail', component: OutletInventoryFormComponent },
  { path: 'count-inventory/warehouse/new', component: WarehouseInventoryFormComponent },
  { path: 'count-inventory/warehouse/:outletName/detail', component: WarehouseInventoryFormComponent },
  { path: 'move-inventory', component: MoveInventoryComponent },
  { path: 'track-inventory', component: InventoryTrackerComponent },
  { path: 'product-look-up', component: ProductLookUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockControlRoutingModule { }
