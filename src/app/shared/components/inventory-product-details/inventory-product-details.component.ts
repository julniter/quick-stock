import { Component, OnInit, Input } from '@angular/core';
import { ProductInventoryItem, InventoryProductVariations } from 'src/app/inventory.model';

@Component({
  selector: 'app-inventory-product-details',
  templateUrl: './inventory-product-details.component.html',
  styleUrls: ['./inventory-product-details.component.css']
})
export class InventoryProductDetailsComponent implements OnInit {

  @Input() inventoryProducts: ProductInventoryItem[];

  constructor() {}

  ngOnInit() {
    if (this.inventoryProducts === undefined) {
      this.inventoryProducts = [];
    }
  }

  getTotalCount(variations: InventoryProductVariations[]) {
    const sum = variations.map(v => v.count).reduce((a, b) => +a + +b, 0);
    return +sum;
  }
}
