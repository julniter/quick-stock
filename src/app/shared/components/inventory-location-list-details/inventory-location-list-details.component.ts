import { Component, OnInit, Input } from '@angular/core';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import { OutletInventorySnapshot, WarehouseInventorySnapshot } from 'src/app/inventory.model';

@Component({
  selector: 'app-inventory-location-list-details',
  templateUrl: './inventory-location-list-details.component.html',
  styleUrls: ['./inventory-location-list-details.component.css']
})
export class InventoryLocationListDetailsComponent implements OnInit {

  @Input() product: ProductListItem;
  @Input() outlets: OutletInventorySnapshot[];
  @Input() warehouses: WarehouseInventorySnapshot[];

  constructor() {}

  ngOnInit() {
  }

}
