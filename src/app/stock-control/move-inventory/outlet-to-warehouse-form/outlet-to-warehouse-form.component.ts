import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/app/shared/spinner.service';
import {
  ProductVariation,
  ProductListItem
} from 'src/app/products/product-list/product-list-datasource';
import {
  OutletInventorySnapshot,
  WarehouseInventorySnapshot,
  ProductInventoryItem,
  InventorySnopshot
} from 'src/app/inventory.model';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';

@Component({
  selector: 'app-outlet-to-warehouse-form',
  templateUrl: './outlet-to-warehouse-form.component.html',
  styleUrls: ['./outlet-to-warehouse-form.component.css']
})
export class OutletToWarehouseFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'OutletToOutletFormComponent';
  outletInventorySnapshot: OutletInventorySnapshot;
  destinationWarehouseInventorySnapshot: WarehouseInventorySnapshot;
  outletToWarehouseForm = this.fb.group({
    outletId: [null, Validators.required],
    destinationWarehouseId: [null, Validators.required],
    products: this.fb.array([])
  });

  @Input() outletItems: OutletListItem[];
  @Input() warehouseItems: WarehouseListItem[];
  @Input() productItems: ProductListItem[];

  filteredProductItems: ProductListItem[] = [];
  selectedProducts: ProductListItem[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService
  ) {}

  ngOnInit() {
  }

  get products() {
    return this.outletToWarehouseForm.get('products') as FormArray;
  }

  getProductVariations(i) {
    return this.products.controls[i].get('productVariations') as FormArray;
  }

  setFilteredProduct(snapshot: InventorySnopshot) {
    this.filteredProductItems = this.productItems.filter(p => {
      return (snapshot.productInventory.find(f => f.id === p.id) !== undefined);
    });
  }

  setOriginSnapshot($event: {value: string}) {
    this.products.controls = [];
    this.selectedProducts = [];

    this.spinner.show(this.spinnerName);
    this.$db.getLatestOutletSnapshot($event.value).then(res => {
      this.outletInventorySnapshot = res.docs[0].data() as OutletInventorySnapshot;
      this.setFilteredProduct(this.outletInventorySnapshot.snapshot);
    }).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
  }

  setDestinationSnapshot($event: {value: string}) {
    this.products.controls = [];
    this.selectedProducts = [];

    this.spinner.show(this.spinnerName);
    this.$db.getLatestWarehouseSnapshot($event.value).then(res => {
      this.destinationWarehouseInventorySnapshot = res.docs[0].data() as WarehouseInventorySnapshot;
    }).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
  }

  setSelectedProduct($event: { value: ProductListItem }) {
    this.selectedProduct = $event.value;
  }

  addProduct(product: ProductListItem) {
    this.selectedProduct = product;

    if (this.selectedProduct) {
      const selectedProduct: ProductInventoryItem = Object.assign(
        { reOrderPoint: null, productVariations: [] },
        this.selectedProduct
      );

      this.selectedProducts.push(
        selectedProduct
      );

      this.products.push(
        this.fb.group({
          reOrderPoint: [selectedProduct.reOrderPoint, Validators.required],
          productVariations: this.fb.array(
            this.createProductVariationFormArray(
              selectedProduct.product.variations
            )
          )
        })
      );

      this.selectedProduct = null;
    }
  }

  getProductName(index: number) {
    if (this.selectedProducts[index]) {
      return this.selectedProducts[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.selectedProducts[index]) {
      return this.selectedProducts[index]
        .product.variations.length;
    }

    return '';
  }

  createProductVariationFormArray(variations: ProductVariation[]) {
    return variations.map((v: ProductVariation) => {
      return this.fb.group({
        name: [{ value: v.name, disabled: true }, Validators.required],
        sku: [{ value: v.sku, disabled: true }, Validators.required],
        code: [{ value: v.code, disabled: true }, Validators.required],
        price: [{ value: v.price, disabled: true }, Validators.required],
        count: [0, Validators.required]
      });
    });
  }

  removeProduct(i: number) {
    this.selectedProducts.splice(i, 1);
    this.products.removeAt(i);
  }

  onSubmit() {
    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    const inventoryForm = this.outletToWarehouseForm.getRawValue();

    if (this.products.controls.length > 0 && inventoryForm.outletId !== inventoryForm.destinationWarehouseId) {

      this.spinner.show(this.spinnerName);

      this.outletInventorySnapshot.snapshot
      = this.$db.updateSnapshotLessProduct(
        this.outletInventorySnapshot.snapshot,
        inventoryForm.products, this.selectedProducts
        );

      this.outletInventorySnapshot.productIds
      = this.outletInventorySnapshot.snapshot.productInventory.map(p => p.id);

      this.destinationWarehouseInventorySnapshot.snapshot
      = this.$db.updateSnapshotAddProduct(
        this.destinationWarehouseInventorySnapshot.snapshot,
        inventoryForm.products, this.selectedProducts
        );

      this.destinationWarehouseInventorySnapshot.productIds
      = this.destinationWarehouseInventorySnapshot.snapshot.productInventory.map(p => p.id);

      const origin = this.$db.outlet.ref.doc();
      const destination = this.$db.warehouse.ref.doc();
      const timeStamp = firebase.firestore.FieldValue.serverTimestamp();

      this.outletInventorySnapshot.id = origin.id;
      this.outletInventorySnapshot.createdAt = timeStamp;
      this.destinationWarehouseInventorySnapshot.id = destination.id;
      this.destinationWarehouseInventorySnapshot.createdAt = timeStamp;

      Promise.all([
        this.$db.saveOutlet(this.outletInventorySnapshot),
        this.$db.warehouseSnapshot(this.destinationWarehouseInventorySnapshot)
      ])
      .catch(errorFn)
      .finally(finallyFn);

    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
