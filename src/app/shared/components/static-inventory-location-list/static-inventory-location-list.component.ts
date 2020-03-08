import { Component, OnInit, Input } from '@angular/core';
import { LocationInventorySnapshot, ProductInventoryItem, InventoryProductVariations } from 'src/app/inventory.model';
import { ProductListItem, ProductVariation } from 'src/app/products/product-list/product-list-datasource';

export interface DynamicColumn {
  key: string;
  value: string;
}

@Component({
  selector: 'app-static-inventory-location-list',
  templateUrl: './static-inventory-location-list.component.html',
  styleUrls: ['./static-inventory-location-list.component.css']
})
export class StaticInventoryLocationListComponent implements OnInit {

  @Input() product: ProductListItem;
  @Input() inventorySnapshots: LocationInventorySnapshot[];

  displayedColumns = ['summary', 'reOrderPoint'];
  dynamicDisplayedColumns: DynamicColumn[] = [];

  constructor() {}

  ngOnInit() {
    if (this.product !== undefined && this.inventorySnapshots !== undefined) {

      this.product.product.variations.map((v, index) => {
        const dc = {key: ('v' + index), value: v.name} as DynamicColumn;
        this.dynamicDisplayedColumns.push(dc);
      });

      this.displayedColumns = this.displayedColumns.concat(this.dynamicDisplayedColumns.map(d => d.key), ['total']);

      this.inventorySnapshots = this.inventorySnapshots.map(i => {
        i.snapshot.productInventory = i.snapshot.productInventory.filter(p => p.id === this.product.id);
        return i;
      });
    }
  }

  getTotal(variations: InventoryProductVariations[]) {
    return +variations.map(v => v.count).reduce((a, b) => +a + +b, 0);
  }
}
