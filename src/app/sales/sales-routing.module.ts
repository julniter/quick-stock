import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesComponent } from './sales.component';
import { JobOrderListComponent } from './job-order-list/job-order-list.component';
import { JobOrderDetailComponent } from './job-order-detail/job-order-detail.component';

const routes: Routes = [
  { path: '', component: SalesComponent },
  { path: 'job-orders', component: JobOrderListComponent },
  { path: 'job-orders/new', component: JobOrderDetailComponent },
  { path: 'job-orders/:jobOrderId/details', component: JobOrderDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
