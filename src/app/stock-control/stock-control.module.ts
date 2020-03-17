import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockControlRoutingModule } from './stock-control-routing.module';
import { StockControlComponent } from './stock-control.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { OutletInventoryFormComponent } from './count-inventory/outlet-inventory-form/outlet-inventory-form.component';
import { MoveInventoryComponent } from './move-inventory/move-inventory.component';
import { WarehouseInventoryFormComponent } from './count-inventory/warehouse-inventory-form/warehouse-inventory-form.component';
import { OutletToWarehouseFormComponent } from './move-inventory/outlet-to-warehouse-form/outlet-to-warehouse-form.component';
import { OutletToOutletFormComponent } from './move-inventory/outlet-to-outlet-form/outlet-to-outlet-form.component';
import { WarehouseToOutletFormComponent } from './move-inventory/warehouse-to-outlet-form/warehouse-to-outlet-form.component';
import { WarehouseToWarehouseFormComponent } from './move-inventory/warehouse-to-warehouse-form/warehouse-to-warehouse-form.component';
import { CountInventoryComponent } from './count-inventory/count-inventory.component';
import { InventoryTrackerComponent } from './inventory-tracker/inventory-tracker.component';
import { OutletInventoryTrackerFormComponent } from './inventory-tracker/outlet-inventory-tracker-form/outlet-inventory-tracker-form.component';
import { WarehouseInventoryTrackerFormComponent } from './inventory-tracker/warehouse-inventory-tracker-form/warehouse-inventory-tracker-form.component';
import { ProductLookUpComponent } from './product-look-up/product-look-up.component';
import { OutletInventoryListComponent } from './count-inventory/outlet-inventory-list/outlet-inventory-list.component';
import { WarehouseInventoryListComponent } from './count-inventory/warehouse-inventory-list/warehouse-inventory-list.component';
import { MoveInventoryListComponent } from './move-inventory/move-inventory-list/move-inventory-list.component';


@NgModule({
  declarations: [
    StockControlComponent,
    CountInventoryComponent,
    OutletInventoryFormComponent,
    WarehouseInventoryFormComponent,
    MoveInventoryComponent,
    OutletToWarehouseFormComponent,
    OutletToOutletFormComponent,
    WarehouseToOutletFormComponent,
    WarehouseToWarehouseFormComponent,
    InventoryTrackerComponent,
    OutletInventoryTrackerFormComponent,
    WarehouseInventoryTrackerFormComponent,
    ProductLookUpComponent,
    OutletInventoryListComponent,
    WarehouseInventoryListComponent,
    MoveInventoryListComponent
  ],
  imports: [
    CommonModule,
    StockControlRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class StockControlModule { }
