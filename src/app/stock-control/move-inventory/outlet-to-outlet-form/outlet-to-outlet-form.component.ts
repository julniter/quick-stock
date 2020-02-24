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
  InventorySnopshot
} from 'src/app/inventory.model';
import * as firebase from 'firebase';
import { InventoryService } from 'src/app/inventory.service';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';

@Component({
  selector: 'app-outlet-to-outlet-form',
  templateUrl: './outlet-to-outlet-form.component.html',
  styleUrls: ['./outlet-to-outlet-form.component.css']
})
export class OutletToOutletFormComponent implements OnInit {
  isNew = false;
  selectedProduct: ProductListItem;
  spinnerName = 'OutletToOutletFormComponent';
  outletInventorySnapshot: OutletInventorySnapshot;
  destinationOutletInventorySnapshot: OutletInventorySnapshot;
  outletToOutletForm = this.fb.group({
    outletId: [null, Validators.required],
    destinationOutletId: [null, Validators.required],
    products: this.fb.array([])
  });

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
    return this.outletToOutletForm.get('products') as FormArray;
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
    this.$db.getLatestOutletSnapshot($event.value).then(res => {
      this.destinationOutletInventorySnapshot = res.docs[0].data() as OutletInventorySnapshot;
    }).finally(() => {
      this.spinner.hide(this.spinnerName);
    });
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

    const inventoryForm = this.outletToOutletForm.getRawValue();

    if (this.products.controls.length > 0 && inventoryForm.outletId !== inventoryForm.destinationOutletId) {

      this.spinner.show(this.spinnerName);

      this.outletInventorySnapshot.snapshot =
      this.$db.updateSnapshotLessProduct(this.outletInventorySnapshot.snapshot, inventoryForm.products, this.selectedProducts);
      this.destinationOutletInventorySnapshot.snapshot =
      this.$db.updateSnapshotAddProduct(this.destinationOutletInventorySnapshot.snapshot, inventoryForm.products, this.selectedProducts);

      const origin = this.$db.outlet().ref.doc();
      const destination = this.$db.outlet().ref.doc();
      const timeStamp = firebase.firestore.FieldValue.serverTimestamp();

      this.outletInventorySnapshot.id = origin.id;
      this.outletInventorySnapshot.createdAt = timeStamp;
      this.destinationOutletInventorySnapshot.id = destination.id;
      this.destinationOutletInventorySnapshot.createdAt = timeStamp;

      Promise.all([
        this.$db.outletSnapshot(inventoryForm.outletId)
        .doc(this.outletInventorySnapshot.id)
        .set(this.outletInventorySnapshot),
        this.$db.outletSnapshot(inventoryForm.destinationOutletId)
        .doc(this.destinationOutletInventorySnapshot.id)
        .set(this.destinationOutletInventorySnapshot)
      ])
      .catch(errorFn)
      .finally(finallyFn);

    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
