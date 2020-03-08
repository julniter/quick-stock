import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import {
  JobOrderListItem,
  JobOrderStatus,
  JobOrderType,
  getJobOrderTypes,
  JobOrderProductVariation
} from '../job-order-list/job-order-list-datasource';
import { Router } from '@angular/router';
import { JobOrdersService } from 'src/app/sales-job-orders.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { PageMode } from 'src/app/firebase.meta';
import { CustomerListItem } from 'src/app/customers/customer-list/customer-list-datasource';
import { ProductSupplierListItem } from 'src/app/products/product-supplier-list/product-supplier-list-datasource';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { ProductListItem, ProductVariation } from 'src/app/products/product-list/product-list-datasource';
import { CustomersService } from 'src/app/customers.service';
import { ProductSuppliersService } from 'src/app/product-suppliers.service';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { ProductsService } from 'src/app/products.service';

@Component({
  selector: 'app-job-order-detail',
  templateUrl: './job-order-detail.component.html',
  styleUrls: ['./job-order-detail.component.css']
})
export class JobOrderDetailComponent implements OnInit {
  spinnerName = 'JobOrderDetailComponent';
  pageMode = PageMode.New;
  jobOrderItem: JobOrderListItem;
  jobOrderForm = this.fb.group({
    referenceNumber: [null],
    type: [null, Validators.required],
    customerId : [null],
    warehouseId: [null, Validators.required],
    supplierId: [null, Validators.required],
    productId: [null, Validators.required],
    productVariations: this.fb.array([this.fb.group({
      name: [null, Validators.required],
      sku: [null, Validators.required],
      code: [null, Validators.required],
      price: [null, Validators.required],
      targetCount: [null, Validators.required]
    })])
  });

  hasUnitNumber = false;

  jobOrderTypeItems: string[] = [];
  customerItems: CustomerListItem[] = [];
  supplierItems: ProductSupplierListItem[] = [];
  warehouseItems: WarehouseListItem[] = [];
  productItems: ProductListItem[] = [];
  pageModes = PageMode;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: JobOrdersService,
    private spinner: SpinnerService,
    private $dbCustomers: CustomersService,
    private $dbSuppliers: ProductSuppliersService,
    private $dbWarehouses: WarehousesService,
    private $dbProducts: ProductsService) {}

    ngOnInit() {

      this.loadData();

      this.jobOrderItem = window.history.state.item;
      this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

      if (this.jobOrderItem === undefined && this.router.url !== '/sales/job-orders/new') {
        this.back();
      }

      if (this.jobOrderItem === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.jobOrderItem = {
          id: ref.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          warehouse: null,
          supplier: null,
          product: null,
          customer: null,
          status: JobOrderStatus.Pending,
          jobOrder: {
            referenceNumber: null,
            type: JobOrderType.External,
            customerId: null,
            supplierId: null,
            warehouseId: null,
            productId: null,
            productVariations: [{
              name: '',
              price: 0,
              sku: '',
              code: '',
              targetCount: null
            }]
          }
        }
      } else {
        console.log(this.jobOrderItem);
        this.jobOrderForm.setValue(this.jobOrderItem.jobOrder);

        if (this.pageMode === PageMode.Copy) {
          const ref = this.$db.ref().ref.doc();
          this.jobOrderItem.id = ref.id;
        }
      }

      if (this.pageMode === PageMode.View) {

        this.jobOrderForm.get('jobOrderTypeItem');
        this.jobOrderForm.get('customerId');
        this.jobOrderForm.get('supplierId');
        this.jobOrderForm.get('warehouseId');
        this.jobOrderForm.get('productId');

        if (this.productVariations.controls.length) {

          [].fill(0, 0, this.productVariations.controls.length).map(((v, i) => {
            if (this.productVariations.controls[i]) {
              this.productVariations.controls[i].get('name').disable();
              this.productVariations.controls[i].get('sku').disable();
              this.productVariations.controls[i].get('code').disable();
              this.productVariations.controls[i].get('price').disable();
              this.productVariations.controls[i].get('targetCount').disable();
            }
          }));
        }
      }
    }

    loadData() {
      this.spinner.show(this.spinnerName);

      this.jobOrderTypeItems = getJobOrderTypes();

      return Promise.all([
        this.$dbCustomers.ref().get().toPromise().then(items => {
          if (items.docs.length) {
            return this.customerItems = items.docs.map(d => d.data()) as any;
          } else {
            return this.customerItems = [];
          }
        }),
        this.$dbProducts.ref().get().toPromise().then(items => {
          if (items.docs.length) {
            return this.productItems = items.docs.map(d => d.data()) as any;
          } else {
            return this.productItems = [];
          }
        }),
        this.$dbSuppliers.ref().get().toPromise().then(items => {
          if (items.docs.length) {
            return this.supplierItems = items.docs.map(d => d.data()) as any;
          } else {
            return this.supplierItems = [];
          }
        }),
        this.$dbWarehouses.ref().get().toPromise().then(items => {
          if (items.docs.length) {
            return this.warehouseItems = items.docs.map(d => d.data()) as any;
          } else {
            return this.warehouseItems = [];
          }
        })
      ]).then(res => {
        this.jobOrderForm.setValue(this.jobOrderItem.jobOrder);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        this.spinner.hide(this.spinnerName);
      });
    }

    setCustomerFormControlState($event: { value: JobOrderType }) {
      if ($event.value === JobOrderType.Internal) {
        this.customer.disable();
        this.customer.setValidators([]);
      } else {
        this.customer.enable();
        this.customer.setValidators([Validators.required]);
      }
    }

    setProductVariationFormControls($event: { value: string }) {
      const selectedProduct = this.productItems.find((p: ProductListItem) => p.id === $event.value);

      this.productVariations.controls = [];

      if (selectedProduct) {
        selectedProduct.product.variations.map((variation: ProductVariation) => {
          this.createItem(variation as any);
        });
      }
    }

    private createItem(variation: JobOrderProductVariation) {
      this.productVariations.push(this.fb.group({
        name: [{value: variation.name, disabled: true}, Validators.required],
        sku: [{value: variation.sku, disabled: true}, Validators.required],
        code: [{value: variation.code, disabled: true}, Validators.required],
        price: [{value: variation.price, disabled: true}, Validators.required],
        targetCount: [(variation.targetCount || null ), Validators.required]
      }));
    }

    get jobOrderType() {
      return this.jobOrderForm.get('type');
    }

    get customer() {
      return this.jobOrderForm.get('customerId');
    }

    get productVariations() {
      return this.jobOrderForm.get('productVariations') as FormArray;
    }

    onSubmit() {
      if (!this.jobOrderForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.jobOrderItem.jobOrder = this.jobOrderForm.getRawValue();

      const errorFn = error => {
        console.log(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      this.jobOrderItem.status = PageMode.Edit ? JobOrderStatus.Pending : this.jobOrderItem.status;
      this.jobOrderItem.customer = this.customerItems.find(i => i.id === this.jobOrderForm.get('customerId').value);
      this.jobOrderItem.supplier = this.supplierItems.find(i => i.id === this.jobOrderForm.get('supplierId').value);
      this.jobOrderItem.warehouse = this.warehouseItems.find(i => i.id === this.jobOrderForm.get('warehouseId').value);
      this.jobOrderItem.product = this.productItems.find(i => i.id === this.jobOrderForm.get('productId').value);

      if (this.pageMode === PageMode.New || this.pageMode === PageMode.Copy) {
        this.$db.ref().doc(this.jobOrderItem.id).set(this.jobOrderItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.jobOrderItem.id).update(this.jobOrderItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['sales/job-orders']);
    }

    getControls() {
      return (this.jobOrderForm.get('productVariations') as FormArray).controls;
    }
}
