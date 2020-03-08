import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsComponent } from './reports.component';
import { OutletSummaryComponent } from './outlet-summary/outlet-summary.component';
import { WarehouseSummaryComponent } from './warehouse-summary/warehouse-summary.component';
import { ProductSummaryComponent } from './product-summary/product-summary.component';

const routes: Routes = [
  { path: '', component: ReportsComponent },
  { path: 'outlet-summary', component: OutletSummaryComponent },
  { path: 'warehouse-summary', component: WarehouseSummaryComponent },
  { path: 'product-summary', component: ProductSummaryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
