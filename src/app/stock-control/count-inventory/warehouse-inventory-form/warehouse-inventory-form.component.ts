import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/app/shared/spinner.service';
import {
  ProductVariation,
  ProductListItem
} from 'src/app/products/product-list/product-list-datasource';
import {
  WarehouseInventorySnapshot,
  ProductInventoryItem
} from 'src/app/inventory.model';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';

@Component({
  selector: 'app-warehouse-inventory-form',
  templateUrl: './warehouse-inventory-form.component.html',
  styleUrls: ['./warehouse-inventory-form.component.css']
})
export class WarehouseInventoryFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'WarehouseInventoryFormComponent';
  warehouseInventorySnapshot: WarehouseInventorySnapshot;
  warehouseInventoryForm = this.fb.group({
    warehouseId: [null, Validators.required],
    products: this.fb.array([])
  });

  @Input() warehouseItems: WarehouseListItem[];
  @Input() productItems: ProductListItem[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService
  ) {}

  ngOnInit() {
    const ref = this.$db.warehouse().ref.doc();
    this.warehouseInventorySnapshot = {
      id: ref.id,
      isActive: true,
      isDeleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      warehouse: null,
      snapshot: {
        productInventory: []
      }
    };
  }

  get products() {
    return this.warehouseInventoryForm.get('products') as FormArray;
  }

  getProductVariations(i) {
    return this.products.controls[i].get('productVariations') as FormArray;
  }

  setSelectedProduct($event: { value: ProductListItem }) {
    this.selectedProduct = $event.value;
  }

  addProduct() {
    if (this.selectedProduct) {
      const selectedProduct: ProductInventoryItem = Object.assign(
        { reOrderPoint: null, productVariations: [] },
        this.selectedProduct
      );

      this.warehouseInventorySnapshot.snapshot.productInventory.push(
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
    if (this.warehouseInventorySnapshot.snapshot.productInventory[index]) {
      return this.warehouseInventorySnapshot.snapshot.productInventory[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.warehouseInventorySnapshot.snapshot.productInventory[index]) {
      return this.warehouseInventorySnapshot.snapshot.productInventory[index]
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
    this.warehouseInventorySnapshot.snapshot.productInventory.splice(i, 1);
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

      const inventoryForm = this.warehouseInventoryForm.getRawValue();

      this.warehouseInventorySnapshot.warehouse = this.warehouseItems.find(o => o.id === inventoryForm.warehouseId).warehouse;
      this.warehouseInventorySnapshot.snapshot.productInventory = this.warehouseInventorySnapshot.snapshot.productInventory
      .map(
        (pi: ProductInventoryItem, index) => {
        pi.reOrderPoint = inventoryForm.products[index].reOrderPoint;
        pi.productVariations = inventoryForm.products[index].productVariations;
        return pi;
      });

      this.$db
        .warehouseSnapshot(inventoryForm.warehouseId)
        .doc(this.warehouseInventorySnapshot.id)
        .set(this.warehouseInventorySnapshot)
        .catch(errorFn)
        .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
