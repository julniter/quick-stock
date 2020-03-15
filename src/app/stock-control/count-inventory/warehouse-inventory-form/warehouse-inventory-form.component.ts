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
  ProductInventoryItem,
  InventoryProductVariations,
  InventorySnapshotStatus
} from 'src/app/inventory.model';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { PageMode } from 'src/app/firebase.meta';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { ProductsService } from 'src/app/products.service';

@Component({
  selector: 'app-warehouse-inventory-form',
  templateUrl: './warehouse-inventory-form.component.html',
  styleUrls: ['./warehouse-inventory-form.component.css']
})
export class WarehouseInventoryFormComponent implements OnInit {
  isNew = false;
  pageMode: PageMode = PageMode.New;
  selectedProduct: ProductListItem;
  spinnerName = 'WarehouseInventoryFormComponent';
  warehouseInventorySnapshot: WarehouseInventorySnapshot;
  warehouseInventoryForm = this.fb.group({
    warehouseId: [null, Validators.required],
    products: this.fb.array([])
  });

  warehouseItems: WarehouseListItem[] = [];
  productItems: ProductListItem[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService,
    private $dbWarehouse: WarehousesService,
    private $dbProduct: ProductsService
  ) {}

  ngOnInit() {

    this.warehouseInventorySnapshot = window.history.state.item;
    this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

    const ref = this.$db.warehouseInventoryUpdate.ref.doc();

    if (this.pageMode === PageMode.New  && this.router.url !== '/stock-control/count-inventory/warehouse/new') {
      this.back();
    }

    if (this.pageMode === PageMode.New) {
      this.warehouseInventorySnapshot = {
        id: ref.id,
        isActive: true,
        isDeleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        warehouse: null,
        productIds: [],
        snapshot: {
          productInventory: []
        }
      };
    } else {
      if (this.warehouseInventorySnapshot === undefined) { this.back(); }

      this.warehouseInventorySnapshot.snapshot.productInventory.map(p => {

        this.addProduct(p);
      });
    }

    this.spinner.show(this.spinnerName);
    Promise.all([
      this.$dbWarehouse.ref().get().toPromise().then(res => {
        this.warehouseItems = res.docs.length ? res.docs.map(d => d.data()) as WarehouseListItem[] : [];
      }),
      this.$dbProduct.ref().get().toPromise().then(res => {
        this.productItems = res.docs.length ? res.docs.map(d => d.data()) as ProductListItem[] : [];
      })
    ])
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      this.spinner.hide(this.spinnerName);
    });
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

  addProduct(product: ProductListItem | ProductInventoryItem) {
    this.selectedProduct = product;

    if (this.selectedProduct) {
      const selectedProduct: ProductInventoryItem = Object.assign(
        { reOrderPoint: product['reOrderPoint'] !== undefined ? product['reOrderPoint'] : null,
        productVariations: product['productVariations'] !== undefined ? product['productVariations'] : [] },
        this.selectedProduct
      );

      const productVariations = product['productVariations'] !== undefined ? product['productVariations'] : selectedProduct.product.variations;

      this.warehouseInventorySnapshot.snapshot.productInventory.push(
        selectedProduct
      );

      this.products.push(
        this.fb.group({
          reOrderPoint: [selectedProduct.reOrderPoint, Validators.required],
          productVariations: this.fb.array(
            this.createProductVariationFormArray(productVariations)
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

  createProductVariationFormArray(variations: InventoryProductVariations[]) {
    return variations.map((v: InventoryProductVariations) => {
      return this.fb.group({
        name: [{ value: v.name, disabled: true }, Validators.required],
        sku: [{ value: v.sku, disabled: true }, Validators.required],
        code: [{ value: v.code, disabled: true }, Validators.required],
        price: [{ value: v.price, disabled: true }, Validators.required],
        count: [(v.count === undefined ? null : v.count), Validators.required]
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
      this.warehouseInventorySnapshot.warehouse = this.warehouseItems.find(o => o.id === inventoryForm.warehouseId);
      this.warehouseInventorySnapshot.snapshot.productInventory = this.warehouseInventorySnapshot.snapshot.productInventory
      .map(
        (pi: ProductInventoryItem, index) => {
        pi.reOrderPoint = inventoryForm.products[index].reOrderPoint;
        pi.productVariations = inventoryForm.products[index].productVariations;
        return pi;
      });

      this.warehouseInventorySnapshot.productIds = this.warehouseInventorySnapshot.snapshot.productInventory.map(p => p.id);
      this.warehouseInventorySnapshot.status = InventorySnapshotStatus.Pending;

      this.$db
      .warehouseInventoryUpdate
      .doc(this.warehouseInventorySnapshot.id)
      .set(this.warehouseInventorySnapshot)
      .catch(errorFn)
      .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control', 'count-inventory']);
  }

  loadLatestSnapshot() {
    const selectedWarehouse = this.warehouseItems.find(o => o.id === this.warehouseInventoryForm.getRawValue().warehouseId);

    this.products.controls = [];

    if (selectedWarehouse !== undefined) {
      this.spinner.show(this.spinnerName);

      this.$db.getLatestWarehouseSnapshot(selectedWarehouse.id).then(res => {
        if (res.docs.length) {
          const snapshot = res.docs[0].data() as WarehouseInventorySnapshot;

          snapshot.snapshot.productInventory.map((pi: ProductInventoryItem) => {

            this.warehouseInventorySnapshot.snapshot.productInventory.push(pi);

            this.products.push(
              this.fb.group({
                reOrderPoint: [pi.reOrderPoint, Validators.required],
                productVariations: this.fb.array(
                  this.createProductVariationFormArray(pi.productVariations)
                )
              })
            );

          });
        }

      }).catch(err => {
        console.error(err);
      }).finally(() => {
        this.spinner.hide(this.spinnerName);
      });
    }
  }
}
