import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockControlComponent } from './stock-control.component';

const routes: Routes = [{ path: '', component: StockControlComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockControlRoutingModule { }
