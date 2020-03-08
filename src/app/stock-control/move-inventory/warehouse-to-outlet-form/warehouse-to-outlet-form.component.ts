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
  OutletInventorySnapshot,
  ProductInventoryItem,
  InventorySnopshot,
  InventoryProductVariations
} from 'src/app/inventory.model';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';

@Component({
  selector: 'app-warehouse-to-outlet-form',
  templateUrl: './warehouse-to-outlet-form.component.html',
  styleUrls: ['./warehouse-to-outlet-form.component.css']
})
export class WarehouseToOutletFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'WarehouseToWarehouseFormComponent';
  warehouseInventorySnapshot: WarehouseInventorySnapshot;
  destinationOutletInventorySnapshot: OutletInventorySnapshot;
  warehouseToOutletForm = this.fb.group({
    warehouseId: [null, Validators.required],
    destinationOutletId: [null, Validators.required],
    products: this.fb.array([])
  });

  @Input() warehouseItems: WarehouseListItem[];
  @Input() outletItems: OutletListItem[];
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
    return this.warehouseToOutletForm.get('products') as FormArray;
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
    this.$db.getLatestWarehouseSnapshot($event.value).then(res => {
      this.warehouseInventorySnapshot = res.docs[0].data() as WarehouseInventorySnapshot;
      this.setFilteredProduct(this.warehouseInventorySnapshot.snapshot);
    }).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
  }

  setDestinationSnapshot($event: {value: string}) {
    this.products.controls = [];
    this.selectedProducts = [];

    this.spinner.show(this.spinnerName);
    this.$db.getLatestOutletSnapshot($event.value).then(res => {
      this.destinationOutletInventorySnapshot = res.docs[0].data() as OutletInventorySnapshot;
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
              selectedProduct.product.variations as any
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

    const inventoryForm = this.warehouseToOutletForm.getRawValue();

    if (this.products.controls.length > 0 && inventoryForm.warehouseId !== inventoryForm.destinationOutletId) {

      this.spinner.show(this.spinnerName);

      this.warehouseInventorySnapshot.snapshot
      = this.$db.updateSnapshotLessProduct(
        this.warehouseInventorySnapshot.snapshot,
        inventoryForm.products, this.selectedProducts
        );

      this.warehouseInventorySnapshot.productIds
      = this.warehouseInventorySnapshot.snapshot.productInventory.map(p => p.id);

      this.destinationOutletInventorySnapshot.snapshot
      = this.$db.updateSnapshotAddProduct(
        this.destinationOutletInventorySnapshot.snapshot,
        inventoryForm.products, this.selectedProducts
        );

      this.destinationOutletInventorySnapshot.productIds
      = this.destinationOutletInventorySnapshot.snapshot.productInventory.map(p => p.id);

      const origin = this.$db.warehouse.ref.doc();
      const destination = this.$db.outlet.ref.doc();
      const timeStamp = firebase.firestore.FieldValue.serverTimestamp();

      this.warehouseInventorySnapshot.id = origin.id;
      this.warehouseInventorySnapshot.createdAt = timeStamp;
      this.destinationOutletInventorySnapshot.id = destination.id;
      this.destinationOutletInventorySnapshot.createdAt = timeStamp;

      Promise.all([
        this.$db.saveWarehouse(this.warehouseInventorySnapshot),
        this.$db.saveOutlet(this.destinationOutletInventorySnapshot)
      ])
      .catch(errorFn)
      .finally(finallyFn);

    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }

  loadLatestSnapshot() {
    const selectedWarehouse = this.warehouseItems.find(o => o.id === this.warehouseToOutletForm.getRawValue().warehouseId);

    this.products.controls = [];
    this.selectedProducts = [];

    if (selectedWarehouse !== undefined) {
      this.spinner.show(this.spinnerName);

      this.$db.getLatestWarehouseSnapshot(selectedWarehouse.id).then(res => {

        if (res.docs) {
          const snapshot = res.docs[0].data() as WarehouseInventorySnapshot;

          this.products.controls = [];
          this.selectedProducts = snapshot.snapshot.productInventory;

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
