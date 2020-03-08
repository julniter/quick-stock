import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { OutletSummaryComponent } from './outlet-summary/outlet-summary.component';
import { WarehouseSummaryComponent } from './warehouse-summary/warehouse-summary.component';
import { ProductSummaryComponent } from './product-summary/product-summary.component';


@NgModule({
  declarations: [
    ReportsComponent,
    OutletSummaryComponent,
    WarehouseSummaryComponent,
    ProductSummaryComponent,
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class ReportsModule { }
