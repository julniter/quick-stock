import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PricingListComponent } from './pricing-list/pricing-list.component';
import { PricingDetailComponent } from './pricing-detail/pricing-detail.component';
import { OutletListComponent } from './outlet-list/outlet-list.component';
import { OutletDetailComponent } from './outlet-detail/outlet-detail.component';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { WarehouseDetailComponent } from './warehouse-detail/warehouse-detail.component';


@NgModule({
  declarations: [
    SetupComponent,
    PricingListComponent,
    PricingDetailComponent,
    OutletListComponent,
    OutletDetailComponent,
    WarehouseListComponent,
    WarehouseDetailComponent
  ],
  imports: [
    CommonModule,
    SetupRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class SetupModule { }
