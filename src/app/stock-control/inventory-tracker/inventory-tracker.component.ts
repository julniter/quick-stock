import { Component, OnInit } from '@angular/core';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { OutletsService } from 'src/app/setup-outlets.service';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-tracker',
  templateUrl: './inventory-tracker.component.html',
  styleUrls: ['./inventory-tracker.component.css']
})
export class InventoryTrackerComponent implements OnInit {

  spinnerName = 'InventoryTrackerComponent';
  outletItems: OutletListItem[] = [];
  warehouseItems: WarehouseListItem[] = [];

  constructor(
    private spinner: SpinnerService,
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
    ]).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
  }

}
