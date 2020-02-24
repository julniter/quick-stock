import { Component, OnInit, Input } from '@angular/core';
import { Warehouse } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { WarehouseInventorySnapshot, ProductInventoryItem } from 'src/app/inventory.model';

@Component({
  selector: 'app-warehouse-inventory-details',
  templateUrl: './warehouse-inventory-details.component.html',
  styleUrls: ['./warehouse-inventory-details.component.css']
})
export class WarehouseInventoryDetailsComponent implements OnInit {

  warehouse: Warehouse = null;
  warehouseProducts: ProductInventoryItem[] = [];

  @Input() warehouseInventorySnapshot: WarehouseInventorySnapshot;

  constructor() {}

  ngOnInit() {
    if (this.warehouseInventorySnapshot !== null && this.warehouseInventorySnapshot !== undefined) {
      this.warehouse = this.warehouseInventorySnapshot.warehouse;
      this.warehouseProducts = this.warehouseInventorySnapshot.snapshot.productInventory;
    }
  }
}
