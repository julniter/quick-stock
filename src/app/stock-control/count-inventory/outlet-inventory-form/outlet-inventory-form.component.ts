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
  InventoryProductVariations,
  InventorySnapshotStatus
} from 'src/app/inventory.model';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { OutletsService } from 'src/app/setup-outlets.service';
import { ProductsService } from 'src/app/products.service';
import { PageMode } from 'src/app/firebase.meta';

@Component({
  selector: 'app-outlet-inventory-form',
  templateUrl: './outlet-inventory-form.component.html',
  styleUrls: ['./outlet-inventory-form.component.css']
})
export class OutletInventoryFormComponent implements OnInit {
  isNew = false;
  pageMode: PageMode = PageMode.New;
  selectedProduct: ProductListItem;
  spinnerName = 'OutletInventoryFormComponent';
  outletInventorySnapshot: OutletInventorySnapshot;
  outletInventoryForm = this.fb.group({
    outletId: [null, Validators.required],
    products: this.fb.array([])
  });

  outletItems: OutletListItem[] = [];
  productItems: ProductListItem[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService,
    private $dbOutlet: OutletsService,
    private $dbProduct: ProductsService
  ) {}

  ngOnInit() {

    this.outletInventorySnapshot = window.history.state.item;
    this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

    const ref = this.$db.outletInventoryUpdate.ref.doc();

    if (this.pageMode === PageMode.New  && this.router.url !== '/stock-control/count-inventory/new') {
      this.back();
    }

    if (this.pageMode === PageMode.New) {
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
    } else {
      if (this.outletInventorySnapshot === undefined) { this.back(); }

      this.outletInventorySnapshot.snapshot.productInventory.map(p => {

        this.addProduct(p);
      });
    }

    this.spinner.show(this.spinnerName);
    Promise.all([
      this.$dbOutlet.ref().get().toPromise().then(res => {
        this.outletItems = res.docs.length ? res.docs.map(d => d.data()) as OutletListItem[] : [];
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
    return this.outletInventoryForm.get('products') as FormArray;
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

      this.outletInventorySnapshot.snapshot.productInventory.push(
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

  createProductVariationFormArray(variations: InventoryProductVariations[]) {
    return (variations as any).map((v: InventoryProductVariations) => {
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
    this.outletInventorySnapshot.snapshot.productInventory.splice(i, 1);
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
      this.outletInventorySnapshot.status = InventorySnapshotStatus.Pending;

      this.$db
        .outletInventoryUpdate
        .doc(this.outletInventorySnapshot.id)
        .set(this.outletInventorySnapshot)
        .catch(errorFn)
        .finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['stock-control', 'count-inventory']);
  }

  loadLatestSnapshot() {
    const selectedOutlet = this.outletItems.find(o => o.id === this.outletInventoryForm.getRawValue().outletId);

    this.products.controls = [];

    if (selectedOutlet !== undefined) {
      this.spinner.show(this.spinnerName);

      this.$db.getLatestOutletSnapshot(selectedOutlet.id).then(res => {

        if (res.docs.length) {
          const snapshot = res.docs[0].data() as OutletInventorySnapshot;

          snapshot.snapshot.productInventory.map((pi: ProductInventoryItem) => {

            this.outletInventorySnapshot.snapshot.productInventory.push(pi);

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
