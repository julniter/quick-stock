import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockControlComponent } from './stock-control.component';
import { MoveInventoryComponent } from './move-inventory/move-inventory.component';
import { CountInventoryComponent } from './count-inventory/count-inventory.component';
import { InventoryTrackerComponent } from './inventory-tracker/inventory-tracker.component';
import { ProductLookUpComponent } from './product-look-up/product-look-up.component';

const routes: Routes = [
  { path: '', component: StockControlComponent },
  { path: 'count-inventory', component: CountInventoryComponent },
  { path: 'move-inventory', component: MoveInventoryComponent },
  { path: 'track-inventory', component: InventoryTrackerComponent },
  { path: 'product-look-up', component: ProductLookUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockControlRoutingModule { }
