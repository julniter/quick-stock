import { Component, OnInit } from '@angular/core';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { first } from 'rxjs/operators';
import { ProductsService } from 'src/app/products.service';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';

@Component({
  selector: 'app-product-look-up',
  templateUrl: './product-look-up.component.html',
  styleUrls: ['./product-look-up.component.css']
})
export class ProductLookUpComponent implements OnInit {

  spinnerName = 'ProductLookUpComponent';
  productItems: ProductListItem[] = [];

  constructor(
    private spinner: SpinnerService,
    private $dbProducts: ProductsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.spinner.show(this.spinnerName);

    this.$dbProducts.ref().valueChanges().pipe(first()).toPromise().then(items => {
      this.productItems = items as any;
    }).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
  }

}
