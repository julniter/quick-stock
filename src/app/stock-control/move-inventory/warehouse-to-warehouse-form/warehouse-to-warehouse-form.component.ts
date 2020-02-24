import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/app/shared/spinner.service';
import {
  ProductVariation,
  ProductListItem
} from 'src/app/products/product-list/product-list-datasource';
import {
  ProductInventoryItem,
  WarehouseInventorySnapshot
} from 'src/app/inventory.model';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';

@Component({
  selector: 'app-warehouse-to-warehouse-form',
  templateUrl: './warehouse-to-warehouse-form.component.html',
  styleUrls: ['./warehouse-to-warehouse-form.component.css']
})
export class WarehouseToWarehouseFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'WarehouseToWarehouseFormComponent';
  warehouseInventorySnapshot: WarehouseInventorySnapshot;
  destinationWarehouseInventorySnapshot: WarehouseInventorySnapshot;
  warehouseToWarehouseForm = this.fb.group({
    warehouseId: [null, Validators.required],
    destinationWarehouseId: [null, Validators.required],
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
    const ref = this.$db.outlet().ref.doc();
    this.destinationWarehouseInventorySnapshot = {
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
    return this.warehouseToWarehouseForm.get('products') as FormArray;
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

      this.destinationWarehouseInventorySnapshot.snapshot.productInventory.push(
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
    if (this.destinationWarehouseInventorySnapshot.snapshot.productInventory[index]) {
      return this.destinationWarehouseInventorySnapshot.snapshot.productInventory[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.destinationWarehouseInventorySnapshot.snapshot.productInventory[index]) {
      return this.destinationWarehouseInventorySnapshot.snapshot.productInventory[index]
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
    this.destinationWarehouseInventorySnapshot.snapshot.productInventory.splice(i, 1);
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

      const inventoryForm = this.warehouseToWarehouseForm.getRawValue();

      this.destinationWarehouseInventorySnapshot.warehouse = this.warehouseItems.find(o => o.id === inventoryForm.warehouseId).warehouse;
      this.destinationWarehouseInventorySnapshot.snapshot.productInventory =
      this.destinationWarehouseInventorySnapshot.snapshot.productInventory
      .map(
        (pi: ProductInventoryItem, index) => {
        pi.reOrderPoint = inventoryForm.products[index].reOrderPoint;
        pi.productVariations = inventoryForm.products[index].productVariations;
        return pi;
      });

      // this.$db
      //   .outletSnapshot(inventoryForm.outletId)
      //   .doc(this.destinationWarehouseInventorySnapshot.id)
      //   .set(this.destinationWarehouseInventorySnapshot)
      //   .catch(errorFn)
      //   .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
