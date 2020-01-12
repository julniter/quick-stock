import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductCategoryListComponent } from './product-category-list/product-categories-list.component';
import { ProductCategoryDetailComponent } from './product-category-detail/product-category-detail.component';
import { ProductBrandListComponent } from './product-brand-list/product-brand-list.component';
import { ProductBrandDetailComponent } from './product-brand-detail/product-brand-detail.component';
import { ProductSupplierListComponent } from './product-supplier-list/product-supplier-list.component';
import { ProductSupplierDetailComponent } from './product-supplier-detail/product-supplier-detail.component';


@NgModule({
  declarations: [
    ProductsComponent,
    ProductDetailComponent,
    ProductListComponent,
    ProductCategoryListComponent,
    ProductCategoryDetailComponent,
    ProductBrandListComponent,
    ProductBrandDetailComponent,
    ProductSupplierListComponent,
    ProductSupplierDetailComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class ProductsModule { }
