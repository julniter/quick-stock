import { Component, OnInit } from '@angular/core';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { OutletsService } from 'src/app/setup-outlets.service';
import { ProductsService } from 'src/app/products.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { WarehousesService } from 'src/app/setup-warehouses.services';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-starting-inventory',
  templateUrl: './count-inventory.component.html',
  styleUrls: ['./count-inventory.component.css']
})
export class CountInventoryComponent implements OnInit {

  spinnerName = 'CountInventoryComponent';
  productItems: ProductListItem[] = [];
  outletItems: OutletListItem[] = [];
  warehouseItems: WarehouseListItem[] = [];

  constructor(
    private spinner: SpinnerService,
    private $dbProducts: ProductsService,
    private $dbOutlets: OutletsService,
    private $dbWarehouses: WarehousesService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.spinner.show(this.spinnerName);

    Promise.all([
      this.$dbOutlets.ref().valueChanges().pipe(first()).toPromise().then(items => {
        this.outletItems = items as any;
      }),

      this.$dbWarehouses.ref().valueChanges().pipe(first()).toPromise().then(items => {
        this.warehouseItems = items as any;
      }),

      this.$dbProducts.ref().valueChanges().pipe(first()).toPromise().then(items => {
        this.productItems = items as any;
      })
    ]).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
  }

}
