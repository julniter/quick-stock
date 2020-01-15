import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupComponent } from './setup.component';
import { PricingListComponent } from './pricing-list/pricing-list.component';
import { PricingDetailComponent } from './pricing-detail/pricing-detail.component';
import { OutletDetailComponent } from './outlet-detail/outlet-detail.component';
import { OutletListComponent } from './outlet-list/outlet-list.component';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { WarehouseDetailComponent } from './warehouse-detail/warehouse-detail.component';

const routes: Routes = [
  { path: '', component: SetupComponent },
  { path: 'pricings', component: PricingListComponent },
  { path: 'pricings/new', component: PricingDetailComponent },
  { path: 'pricings/:pricingName/details', component: PricingDetailComponent },
  { path: 'outlets', component: OutletListComponent },
  { path: 'outlets/new', component: OutletDetailComponent },
  { path: 'outlets/:outletName/details', component: OutletDetailComponent },
  { path: 'warehouses', component: WarehouseListComponent },
  { path: 'warehouses/new', component: WarehouseDetailComponent },
  { path: 'warehouses/:warehouseName/details', component: WarehouseDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
