import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesComponent } from './sales.component';
import { JobOrderListComponent } from './job-order-list/job-order-list.component';
import { JobOrderDetailComponent } from './job-order-detail/job-order-detail.component';
import { OutletSalesListComponent } from './outlet-sales-list/outlet-sales-list.component';
import { OutletSalesDetailComponent } from './outlet-sales-detail/outlet-sales-detail.component';

const routes: Routes = [
  { path: '', component: SalesComponent },
  { path: 'job-orders', component: JobOrderListComponent },
  { path: 'job-orders/new', component: JobOrderDetailComponent },
  { path: 'job-orders/:jobOrderId/details', component: JobOrderDetailComponent },
  { path: 'outlet-sales', component: OutletSalesListComponent },
  { path: 'outlet-sales/new', component: OutletSalesDetailComponent },
  { path: 'outlet-sales/:outletName/view', component: OutletSalesDetailComponent },
  { path: 'outlet-sales/:outletName/details', component: OutletSalesDetailComponent },
  { path: 'outlet-sales/:outletName/copy', component: OutletSalesDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
