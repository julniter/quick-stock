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
  InventoryProductVariations,
  MoveInventorySnapshotType,
  MoveInventorySnapshotStatus,
  MoveInventorySnapshot
} from 'src/app/inventory.model';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { OutletsService } from 'src/app/setup-outlets.service';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { ProductsService } from 'src/app/products.service';
import { PageMode } from 'src/app/firebase.meta';

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

  warehouseItems: WarehouseListItem[];
  outletItems: OutletListItem[];
  productItems: ProductListItem[];

  filteredProductItems: ProductListItem[] = [];
  selectedProducts: ProductListItem[] = [];
  pageMode = PageMode.New;
  moveInventorySnapshot: MoveInventorySnapshot;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService,
    private $dbOutlets: OutletsService,
    private $dbWarehouses: WarehousesService,
    private $dbProducts: ProductsService,
  ) {}

  ngOnInit() {
    this.moveInventorySnapshot = window.history.state.item;
    this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

    if (this.pageMode === PageMode.New && this.router.url !== '/stock-control/move-inventory/warehouse-to-outlet/new') {
      this.back();
    } else {
      if (this.moveInventorySnapshot !== undefined) {
        this.moveInventorySnapshot.productVariations.map((pv: ProductInventoryItem) => {
          this.addProduct(pv);
        });
      }
    }

    this.spinner.show(this.spinnerName);

    Promise.all([
      this.$dbOutlets.ref().get().toPromise().then(items => {
        this.outletItems = items.docs.length ? items.docs.map(i => i.data() as OutletListItem) : [];
      }),
      this.$dbWarehouses.ref().get().toPromise().then(items => {
        this.warehouseItems = items.docs.length ? items.docs.map(i => i.data() as WarehouseListItem) : [];
      }),
      this.$dbProducts.ref().get().toPromise().then(items => {
        this.productItems = items.docs.length ? items.docs.map(i => i.data() as ProductListItem) : [];
      })
    ]).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
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
        { reOrderPoint: product['reOrderPoint'] !== undefined ? product['reOrderPoint'] : null,
        productVariations: product['productVariations'] !== undefined ? product['productVariations'] : [] },
        this.selectedProduct
      );

      const productVariations = product['productVariations'] !== undefined ? product['productVariations'] : selectedProduct.product.variations;

      this.selectedProducts.push(
        selectedProduct as ProductListItem
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
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    const inventoryForm = this.warehouseToOutletForm.getRawValue();
    const origin = this.$db.moveInventory(MoveInventorySnapshotType.WarehouseToOutlet).ref.doc();
    const timeStamp = firebase.firestore.FieldValue.serverTimestamp();

    if (this.products.controls.length > 0 && inventoryForm.warehouseId !== inventoryForm.destinationOutletId) {

      this.spinner.show(this.spinnerName);

      const moveInventory = {
        source: inventoryForm.warehouseId,
        destination: inventoryForm.destinationOutletId,
        productVariations: inventoryForm.products,
        selectedProducts: this.selectedProducts,
        status: MoveInventorySnapshotStatus.Pending,
        type: MoveInventorySnapshotType.WarehouseToOutlet,
        id: origin.id,
        createdAt: timeStamp,
        isActive: true,
        isDeleted: false
      };

      this.$db.moveInventory(MoveInventorySnapshotType.WarehouseToOutlet)
      .doc(moveInventory.id)
      .set(moveInventory)
      .catch(errorFn)
      .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control', 'move-inventory']);
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
