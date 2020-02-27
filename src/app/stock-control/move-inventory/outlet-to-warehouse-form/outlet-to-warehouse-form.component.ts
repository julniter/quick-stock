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
  ProductInventoryItem,
  WarehouseInventorySnapshot
} from 'src/app/inventory.model';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';

@Component({
  selector: 'app-outlet-to-warehouse-form',
  templateUrl: './outlet-to-warehouse-form.component.html',
  styleUrls: ['./outlet-to-warehouse-form.component.css']
})
export class OutletToWarehouseFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'OutletToWarehouseFormComponent';
  outletInventorySnapshot: OutletInventorySnapshot;
  warehouseInventorySnapshot: WarehouseInventorySnapshot;
  outletToWarehouseForm = this.fb.group({
    outletId: [null, Validators.required],
    warehouseId: [null, Validators.required],
    products: this.fb.array([])
  });

  @Input() outletItems: OutletListItem[];
  @Input() warehouseItems: WarehouseListItem[];
  @Input() productItems: ProductListItem[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService
  ) {}

  ngOnInit() {
    const ref = this.$db.outlet().ref.doc();
    this.outletInventorySnapshot = {
      id: ref.id,
      isActive: true,
      isDeleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      outlet: null,
      snapshot: {
        productInventory: []
      }
    };
  }

  get products() {
    return this.outletToWarehouseForm.get('products') as FormArray;
  }

  getProductVariations(i) {
    return this.products.controls[i].get('productVariations') as FormArray;
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

      this.outletInventorySnapshot.snapshot.productInventory.push(
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
    if (this.outletInventorySnapshot.snapshot.productInventory[index]) {
      return this.outletInventorySnapshot.snapshot.productInventory[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.outletInventorySnapshot.snapshot.productInventory[index]) {
      return this.outletInventorySnapshot.snapshot.productInventory[index]
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
        count: [null, Validators.required]
      });
    });
  }

  removeProduct(i: number) {
    this.outletInventorySnapshot.snapshot.productInventory.splice(i, 1);
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

    if (this.products.controls.length > 0) {

      this.spinner.show(this.spinnerName);

      const inventoryForm = this.outletToWarehouseForm.getRawValue();

      this.outletInventorySnapshot.outlet = this.outletItems.find(o => o.id === inventoryForm.outletId).outlet;
      this.outletInventorySnapshot.snapshot.productInventory = this.outletInventorySnapshot.snapshot.productInventory
      .map(
        (pi: ProductInventoryItem, index) => {
        pi.reOrderPoint = inventoryForm.products[index].reOrderPoint;
        pi.productVariations = inventoryForm.products[index].productVariations;
        return pi;
      });

      // this.$db
      //   .outletSnapshot(inventoryForm.outletId)
      //   .doc(this.outletInventorySnapshot.id)
      //   .set(this.outletInventorySnapshot)
      //   .catch(errorFn)
      //   .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
