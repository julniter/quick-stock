import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { OutletSummaryComponent } from './outlet-summary/outlet-summary.component';
import { OutletSummaryResultComponent } from './outlet-summary-result/outlet-summary-result.component';
import { WarehouseSummaryComponent } from './warehouse-summary/warehouse-summary.component';
import { WarehouseSummaryResultComponent } from './warehouse-summary-result/warehouse-summary-result.component';
import { ProductSummaryComponent } from './product-summary/product-summary.component';
import { ProductSummaryResultComponent } from './product-summary-result/product-summary-result.component';


@NgModule({
  declarations: [
    ReportsComponent,
    OutletSummaryComponent,
    OutletSummaryResultComponent,
    WarehouseSummaryComponent,
    WarehouseSummaryResultComponent,
    ProductSummaryComponent,
    ProductSummaryResultComponent
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
