import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsComponent } from './reports.component';
import { OutletSummaryComponent } from './outlet-summary/outlet-summary.component';
import { OutletSummaryResultComponent } from './outlet-summary-result/outlet-summary-result.component';
import { WarehouseSummaryComponent } from './warehouse-summary/warehouse-summary.component';
import { WarehouseSummaryResultComponent } from './warehouse-summary-result/warehouse-summary-result.component';
import { ProductSummaryComponent } from './product-summary/product-summary.component';
import { ProductSummaryResultComponent } from './product-summary-result/product-summary-result.component';

const routes: Routes = [
  { path: '', component: ReportsComponent },
  { path: 'outlet-summary', component: OutletSummaryComponent },
  { path: 'outlet-summary/result', component: OutletSummaryResultComponent },
  { path: 'warehouse-summary', component: WarehouseSummaryComponent },
  { path: 'warehouse-summary/result', component: WarehouseSummaryResultComponent },
  { path: 'product-summary', component: ProductSummaryComponent },
  { path: 'product-summary/result', component: ProductSummaryResultComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
