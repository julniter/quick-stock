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
  InventoryProductVariations
} from 'src/app/inventory.model';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { OutletsService } from 'src/app/setup-outlets.service';
import { ProductsService } from 'src/app/products.service';
import { OutletSalesService } from 'src/app/sales-outlet-sales.service';
import { OutletSalesListItem, OutletSalesStatus } from '../outlet-sales-list/outlet-sales-list-datasource';
import { PageMode } from 'src/app/firebase.meta';

@Component({
  selector: 'app-outlet-sales-detail',
  templateUrl: './outlet-sales-detail.component.html',
  styleUrls: ['./outlet-sales-detail.component.css']
})
export class OutletSalesDetailComponent implements OnInit {
  pageMode: PageMode;
  selectedProduct: ProductListItem;
  spinnerName = 'OutletSalesFormComponent';
  outletSalesListItem: OutletSalesListItem;
  outletSalesForm = this.fb.group({
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
    private $dbProduct: ProductsService,
    private $dbSales: OutletSalesService
  ) {}

  ngOnInit() {
    this.loadData();
    const ref = this.$dbSales.ref().ref.doc();
    const refInventory = this.$dbSales.ref().ref.doc();

    this.outletSalesListItem = window.history.state.item;
    this.pageMode = window.history.state.pageMode;

    if (this.outletSalesListItem === undefined && this.router.url !== '/sales/outlet-sales/new') {
      this.back();
    }

    if (this.outletSalesListItem === undefined) {
      this.outletSalesListItem = {
        id: ref.id,
        isActive: true,
        isDeleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: OutletSalesStatus.Pending,
        outletInventorySnapshot: {
          id: refInventory.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          outlet: null,
          productIds: [],
          snapshot: {
            productInventory: []
          }
        }
      };
    } else {
      this.loadLatestSnapshot(this.outletSalesListItem.outletInventorySnapshot);
    }
  }

  loadData() {
    this.spinner.show(this.spinnerName);

    return Promise.all([
      this.$dbOutlet.ref().get().toPromise()
      .then(res => {
        if (res.docs.length) {
          this.outletItems = res.docs.map(d => d.data()) as OutletListItem[];
        }
      }),
      this.$dbProduct.ref().get().toPromise()
      .then(res => {
        if (res.docs.length) {
          this.productItems = res.docs.map(d => d.data()) as ProductListItem[];
        }
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
    return this.outletSalesForm.get('products') as FormArray;
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

      this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory.push(
        selectedProduct
      );

      this.products.push(
        this.fb.group({
          reOrderPoint: [{ value: selectedProduct.reOrderPoint, disabled: true }, Validators.required],
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
    if (this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory[index]) {
      return this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory[index]) {
      return this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory[index]
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
    this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory.splice(i, 1);
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

      const inventoryForm = this.outletSalesForm.getRawValue();

      this.outletSalesListItem.outletInventorySnapshot.outlet
      = this.outletItems.find(o => o.id === inventoryForm.outletId);

      this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory
      = this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory
      .map(
        (pi: ProductInventoryItem, index) => {
        pi.reOrderPoint = inventoryForm.products[index].reOrderPoint;
        pi.productVariations = inventoryForm.products[index].productVariations;
        return pi;
      });

      this.outletSalesListItem.outletInventorySnapshot.productIds
      = this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory.map(p => p.id);

      if (window.history.state.pageMode === PageMode.Edit) {
        this.$dbSales.ref()
          .doc(this.outletSalesListItem.id)
          .update(this.outletSalesListItem)
          .catch(errorFn)
          .finally(finallyFn);
      } else {
        this.$dbSales.ref()
          .doc(this.outletSalesListItem.id)
          .set(this.outletSalesListItem)
          .catch(errorFn)
          .finally(finallyFn);
      }
    }
  }

  back() {
    this.router.navigate(['sales']);
  }

  loadLatestSnapshot(outletSnapshot: OutletInventorySnapshot = null) {
    const selectedOutlet = this.outletItems.find(o => o.id === this.outletSalesForm.getRawValue().outletId);

    this.products.controls = [];

    if (selectedOutlet !== undefined && outletSnapshot == null) {
      this.spinner.show(this.spinnerName);

      this.$db.getLatestOutletSnapshot(selectedOutlet.id).then(res => {

        if (res.docs.length) {
          const snapshot = res.docs[0].data() as OutletInventorySnapshot;

          snapshot.snapshot.productInventory.map((pi: ProductInventoryItem) => {

            this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory.push(pi);

            this.products.push(
              this.fb.group({
                reOrderPoint: [{ value: pi.reOrderPoint, disabled: true } , Validators.required],
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
    } else {
      outletSnapshot.snapshot.productInventory.map((pi: ProductInventoryItem) => {

        this.outletSalesListItem.outletInventorySnapshot.snapshot.productInventory.push(pi);

        if (this.pageMode !== PageMode.Copy) {
          this.outletSalesForm.get('outletId').setValue(this.outletSalesListItem.outletInventorySnapshot.outlet.id);
        }

        this.products.push(
          this.fb.group({
            reOrderPoint: [{ value: pi.reOrderPoint, disabled: true } , Validators.required],
            productVariations: this.fb.array(
              this.createProductVariationFormArray(pi.productVariations)
            )
          })
        );

      });
    }
  }
}
