import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductsComponent } from './products.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductCategoryListComponent } from './product-category-list/product-categories-list.component';
import { ProductCategoryDetailComponent } from './product-category-detail/product-category-detail.component';
import { ProductBrandListComponent } from './product-brand-list/product-brand-list.component';
import { ProductBrandDetailComponent } from './product-brand-detail/product-brand-detail.component';
import { ProductSupplierListComponent } from './product-supplier-list/product-supplier-list.component';
import { ProductSupplierDetailComponent } from './product-supplier-detail/product-supplier-detail.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'list', component: ProductListComponent },
  { path: 'details', component: ProductDetailComponent },
  { path: 'categories', component: ProductCategoryListComponent },
  { path: 'categories/new', component: ProductCategoryDetailComponent },
  { path: 'categories/:productCategoryName/details', component: ProductCategoryDetailComponent },
  { path: 'brands', component: ProductBrandListComponent },
  { path: 'brands/new', component: ProductBrandDetailComponent },
  { path: 'brands/:productBrandName/details', component: ProductBrandDetailComponent },
  { path: 'suppliers', component: ProductSupplierListComponent },
  { path: 'suppliers/new', component: ProductSupplierDetailComponent },
  { path: 'suppliers/:productSupplierCompany/details', component: ProductSupplierDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
