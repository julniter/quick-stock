import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { JobOrderListComponent } from './job-order-list/job-order-list.component';
import { JobOrderDetailComponent } from './job-order-detail/job-order-detail.component';
import { OutletSalesListComponent } from './outlet-sales-list/outlet-sales-list.component';
import { OutletSalesDetailComponent } from './outlet-sales-detail/outlet-sales-detail.component';


@NgModule({
  declarations: [
    SalesComponent,
    JobOrderListComponent,
    JobOrderDetailComponent,
    OutletSalesListComponent,
    OutletSalesDetailComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class SalesModule { }
