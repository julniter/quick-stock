import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { MaterialModule } from '../material/material.module';
import { OutletPreviewComponent } from './outlet-preview/outlet-preview.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { WarehousePreviewComponent } from './warehouse-preview/warehouse-preview.component';
import { ProductPreviewComponent } from './product-preview/product-preview.component';



@NgModule({
  declarations: [DashboardComponent, OutletPreviewComponent, WarehousePreviewComponent, ProductPreviewComponent],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
