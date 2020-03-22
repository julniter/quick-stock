import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { JobOrderListItem, JobOrderType, JobOrderStock } from 'src/app/sales/job-order-list/job-order-list-datasource';
import { Validators, FormBuilder, FormArray } from '@angular/forms';
import { ProductInventoryItem, InventoryProductVariations, WarehouseInventorySnapshot } from 'src/app/inventory.model';
import { SpinnerService } from '../spinner.service';
import { InventoryService } from 'src/app/inventory.service';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import * as firebase from 'firebase';

@Component({
  selector: 'app-receive-dialog',
  templateUrl: './receive-dialog.component.html',
  styleUrls: ['./receive-dialog.component.css']
})
export class ReceiveDialogComponent implements OnInit {

  jobOrderForm = this.fb.group({
    products: this.fb.array([])
  });

  constructor(
    public dialogRef: MatDialogRef<ReceiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {jobOrderListItem: JobOrderListItem},
    private fb: FormBuilder,
    private spinner: SpinnerService,
    private $dbInventory: InventoryService
  ) {}

  get products() {
    return this.jobOrderForm.get('products') as FormArray;
  }

  getProductVariations(i) {
    return this.products.controls[i].get('productVariations') as FormArray;
  }

  getProductName(index: number) {
    if (this.data.jobOrderListItem.jobOrder.products[index]) {
      return this.data.jobOrderListItem.jobOrder.products[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.data.jobOrderListItem.jobOrder.products[index]) {
      return this.data.jobOrderListItem.jobOrder.products[index]
        .product.variations.length;
    }

    return '';
  }

  ngOnInit(): void {
    this.data.jobOrderListItem.jobOrder.products.map((pi: ProductInventoryItem) => {
      this.products.push(
        this.fb.group({
          productVariations: this.fb.array(
            this.createProductVariationFormArray(pi.productVariations)
          )
        })
      );
    });
  }

  createProductVariationFormArray(variations: InventoryProductVariations[]) {
    return (variations as any).map((v: InventoryProductVariations) => {
      return this.fb.group({
        name: [{ value: v.name, disabled: true }, Validators.required],
        code: [{ value: v.code, disabled: true }, Validators.required],
        count: [(v.count === undefined ? null : v.count), Validators.required]
      });
    });
  }

  onSubmit() {
    const errorFn = error => {
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
      this.dialogRef.close(true);
    };

    if (this.jobOrderForm.valid) {
      this.spinner.show();
      this.$dbInventory
      .getLatestWarehouseSnapshot(this.data.jobOrderListItem.warehouse.id)
      .then(res => {
        if (res.docs.length) {
          const latestSnapshot = res.docs[0].data() as WarehouseInventorySnapshot;
          latestSnapshot.snapshot
          = this.$dbInventory.updateSnapshotAddProduct(
            latestSnapshot.snapshot,
            this.data.jobOrderListItem.jobOrder.products,
            this.data.jobOrderListItem.jobOrder.products as ProductListItem[]
          );

          latestSnapshot.id = this.$dbInventory.warehouse.ref.doc().id;
          latestSnapshot.createdAt = firebase.firestore.FieldValue.serverTimestamp();

          this.$dbInventory.saveWarehouse(latestSnapshot).catch(errorFn).finally(finallyFn);

        } else {
          const newSnapshot: WarehouseInventorySnapshot = {
            id: this.$dbInventory.warehouse.ref.doc().id,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isDeleted: false,
            isActive: true,
            snapshot: {
              productInventory: this.data.jobOrderListItem.jobOrder.products
            },
            productIds: this.data.jobOrderListItem.jobOrder.products.map(p => p.id),
            warehouse: this.data.jobOrderListItem.warehouse
          };

          this.$dbInventory.saveWarehouse(newSnapshot).catch(errorFn).finally(finallyFn);
        }
      }).catch(errorFn);
    }
  }

}
