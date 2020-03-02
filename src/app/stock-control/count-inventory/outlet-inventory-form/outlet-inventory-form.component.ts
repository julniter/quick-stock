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
  ProductInventoryItem
} from 'src/app/inventory.model';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';

@Component({
  selector: 'app-outlet-inventory-form',
  templateUrl: './outlet-inventory-form.component.html',
  styleUrls: ['./outlet-inventory-form.component.css']
})
export class OutletInventoryFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'OutletInventoryFormComponent';
  outletInventorySnapshot: OutletInventorySnapshot;
  outletInventoryForm = this.fb.group({
    outletId: [null, Validators.required],
    products: this.fb.array([])
  });

  @Input() outletItems: OutletListItem[];
  @Input() productItems: ProductListItem[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService
  ) {}

  ngOnInit() {
    const ref = this.$db.outlet.ref.doc();
    this.outletInventorySnapshot = {
      id: ref.id,
      isActive: true,
      isDeleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      outlet: null,
      productIds: [],
      snapshot: {
        productInventory: []
      }
    };
  }

  get products() {
    return this.outletInventoryForm.get('products') as FormArray;
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

      const inventoryForm = this.outletInventoryForm.getRawValue();

      this.outletInventorySnapshot.outlet = this.outletItems.find(o => o.id === inventoryForm.outletId);
      this.outletInventorySnapshot.snapshot.productInventory = this.outletInventorySnapshot.snapshot.productInventory
      .map(
        (pi: ProductInventoryItem, index) => {
        pi.reOrderPoint = inventoryForm.products[index].reOrderPoint;
        pi.productVariations = inventoryForm.products[index].productVariations;
        return pi;
      });

      this.outletInventorySnapshot.productIds = this.outletInventorySnapshot.snapshot.productInventory.map(p => p.id);

      this.$db
        .saveOutlet(this.outletInventorySnapshot)
        .catch(errorFn)
        .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
