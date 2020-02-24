import { Component, OnInit, Input } from '@angular/core';
import { Outlet } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { OutletInventorySnapshot, ProductInventoryItem } from 'src/app/inventory.model';

@Component({
  selector: 'app-outlet-inventory-details',
  templateUrl: './outlet-inventory-details.component.html',
  styleUrls: ['./outlet-inventory-details.component.css']
})
export class OutletInventoryDetailsComponent implements OnInit {

  outlet: Outlet = null;
  outletProducts: ProductInventoryItem[] = [];

  @Input() outletInventorySnapshot: OutletInventorySnapshot;

  constructor() {}

  ngOnInit() {
    if (this.outletInventorySnapshot !== null && this.outletInventorySnapshot !== undefined) {
      this.outlet = this.outletInventorySnapshot.outlet;
      this.outletProducts = this.outletInventorySnapshot.snapshot.productInventory;
    }
  }
}
