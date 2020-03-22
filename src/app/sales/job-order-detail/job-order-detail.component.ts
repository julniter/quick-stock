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
import { JobOrdersService } from 'src/app/sales-job-orders.service';
import { JobOrderListItem, JobOrderStatus, JobOrderType, JobOrderStock } from '../job-order-list/job-order-list-datasource';
import { PageMode } from 'src/app/firebase.meta';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { CustomersService } from 'src/app/customers.service';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { CustomerListItem } from 'src/app/customers/customer-list/customer-list-datasource';

@Component({
  selector: 'app-job-order-detail',
  templateUrl: './job-order-detail.component.html',
  styleUrls: ['./job-order-detail.component.css']
})
export class JobOrderDetailComponent implements OnInit {
  pageMode: PageMode = PageMode.New;
  spinnerName = 'JobOrderDetailComponent';
  jobOrderListItem: JobOrderListItem;
  jobOrderForm = this.fb.group({
    warehouseId: [null, Validators.required],
    referenceNumber: [null, Validators.required],
    type: [JobOrderType.External, Validators.required],
    stock: [JobOrderStock.New, Validators.required],
    customerId: [null],
    products: this.fb.array([])
  });

  warehouseItems: WarehouseListItem[] = [];
  productItems: ProductListItem[] = [];
  customerItems: CustomerListItem[] = [];
  selectedProducts: ProductListItem[] = [];
  selectedProduct: ProductListItem;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService,
    private $dbWarehouse: WarehousesService,
    private $dbProduct: ProductsService,
    private $dbOrder: JobOrdersService,
    private $dbCustomer: CustomersService
  ) {}

  ngOnInit() {
    const ref = this.$dbOrder.ref().ref.doc();
    const refInventory = this.$dbOrder.ref().ref.doc();

    this.jobOrderListItem = window.history.state.item;
    this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

    if (this.jobOrderListItem === undefined && this.router.url !== '/sales/job-orders/new') {
      this.back();
    }

    if (this.jobOrderListItem === undefined) {
      this.jobOrderListItem = {
        id: ref.id,
        isActive: true,
        isDeleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: JobOrderStatus.Pending,
        warehouse: null,
        productIds: [],
        jobOrder: {
          type: JobOrderType.External,
          products: [],
          referenceNumber: null,
          warehouseId: null,
          stock: JobOrderStock.New
        }
      };
    } else {
      if (this.pageMode === PageMode.Copy) {
        this.jobOrderListItem.id = ref.id;
        this.jobOrderListItem.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
    }

    this.jobOrderForm.get('type').valueChanges.subscribe((value) => {
      if (value === JobOrderType.External) {
        this.jobOrderForm.get('customerId').reset();
        this.jobOrderForm.get('customerId').enable();

        this.jobOrderForm.get('stock').reset();
        this.jobOrderForm.get('stock').enable();
      }

      if (value === JobOrderType.Internal) {
        this.jobOrderForm.get('customerId').reset();
        this.jobOrderForm.get('customerId').disable();

        this.jobOrderForm.get('stock').setValue(JobOrderStock.New);
        this.jobOrderForm.get('stock').disable();
      }
    });

    this.loadData();
  }

  loadData() {
    this.spinner.show(this.spinnerName);

    return Promise.all([
      this.$dbWarehouse.ref().get().toPromise()
      .then(res => {
        if (res.docs.length) {
          this.warehouseItems = res.docs.map(d => d.data()) as WarehouseListItem[];
        }
      }),
      this.$dbProduct.ref().get().toPromise()
      .then(res => {
        if (res.docs.length) {
          this.productItems = res.docs.map(d => d.data()) as ProductListItem[];
        }
      }),
      this.$dbCustomer.ref().get().toPromise()
      .then(res => {
        if (res.docs.length) {
          this.customerItems = res.docs.map(d => d.data()) as CustomerListItem[];
        }
      })
    ])
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      this.spinner.hide(this.spinnerName);
      if (this.pageMode !== PageMode.New) {
        this.jobOrderForm.setValue(Object.assign({...this.jobOrderListItem.jobOrder}, {products: [], customerId: null}));

        this.jobOrderListItem.jobOrder.products.map((pi: ProductInventoryItem) => {
          this.products.push(
            this.fb.group({
              reOrderPoint: [{ value: 0, disabled: true } , Validators.required],
              productVariations: this.fb.array(
                this.createProductVariationFormArray(pi.productVariations)
              )
            })
          );
        });

        if (this.jobOrderListItem.jobOrder.type === JobOrderType.Internal) {
          this.jobOrderForm.get('customerId').reset();
          this.jobOrderForm.get('customerId').disable();

          this.jobOrderForm.get('stock').setValue(JobOrderStock.New);
          this.jobOrderForm.get('stock').disable();
        } else {
          this.jobOrderForm.get('customerId').setValue(this.jobOrderListItem.jobOrder.customerId);
          this.jobOrderForm.get('customerId').enable();
        }
      }
    });
  }

  get products() {
    return this.jobOrderForm.get('products') as FormArray;
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
      const selectedProductInventory: ProductInventoryItem = Object.assign(
        { reOrderPoint: null, productVariations: [] },
        this.selectedProduct
      );

      this.jobOrderListItem.jobOrder.products.push(
        selectedProductInventory
      );

      this.products.push(
        this.fb.group({
          reOrderPoint: [{ value: 0, disabled: true }, Validators.required],
          productVariations: this.fb.array(
            this.createProductVariationFormArray(
              selectedProductInventory.product.variations as any
            )
          )
        })
      );

      this.selectedProduct = null;
    }
  }

  getProductName(index: number) {
    if (this.jobOrderListItem.jobOrder.products[index]) {
      return this.jobOrderListItem.jobOrder.products[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.jobOrderListItem.jobOrder.products[index]) {
      return this.jobOrderListItem.jobOrder.products[index]
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
    this.jobOrderListItem.jobOrder.products.splice(i, 1);
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

    if (this.jobOrderForm.valid) {

      if (this.products.controls.length > 0) {

        this.spinner.show(this.spinnerName);

        const jobOrderFormValues = this.jobOrderForm.getRawValue();

        if (jobOrderFormValues.type === JobOrderType.External) {
          this.jobOrderListItem.customer = this.customerItems.find(c => c.id === jobOrderFormValues.customerId);
          this.jobOrderListItem.jobOrder.customerId = jobOrderFormValues.customerId;
        }

        this.jobOrderListItem.warehouse = this.warehouseItems.find(w => w.id === jobOrderFormValues.warehouseId);
        this.jobOrderListItem.jobOrder.warehouseId = jobOrderFormValues.warehouseId;

        this.jobOrderListItem.jobOrder.referenceNumber = jobOrderFormValues.referenceNumber;
        this.jobOrderListItem.jobOrder.type = jobOrderFormValues.type;
        this.jobOrderListItem.jobOrder.stock = jobOrderFormValues.stock;

        this.jobOrderListItem.jobOrder.products
        = this.jobOrderListItem.jobOrder.products
        .map(
          (pi: ProductInventoryItem, index) => {
          pi.reOrderPoint = jobOrderFormValues.products[index].reOrderPoint;
          pi.productVariations = jobOrderFormValues.products[index].productVariations;
          return pi;
        });

        this.jobOrderListItem.productIds
        = this.jobOrderListItem.jobOrder.products.map(p => p.id);

        if (this.pageMode !== PageMode.New) {
          this.$dbOrder.ref()
          .doc(this.jobOrderListItem.id)
          .update(this.jobOrderListItem)
          .catch(errorFn)
          .finally(finallyFn);
        } else {
          this.$dbOrder.ref()
          .doc(this.jobOrderListItem.id)
          .set(this.jobOrderListItem)
          .catch(errorFn)
          .finally(finallyFn);
        }
      }

    }
  }

  back() {
    this.router.navigate(['sales', 'job-orders']);
  }

}
