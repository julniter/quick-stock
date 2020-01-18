import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { JobOrderListItem, JobOrderStatus, JobOrderType } from '../job-order-list/job-order-list-datasource';
import { Router } from '@angular/router';
import { JobOrdersService } from 'src/app/sales-job-orders,service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { PageMode } from 'src/app/firebase.meta';

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
    type: [null, Validators.required],
    customerId : [null],
    warehouseId: [null, Validators.required],
    supplierId: [null, Validators.required],
    productId: [null, Validators.required],
    status: [null, Validators.required],
    productVariations: this.fb.array([this.fb.group({
      name: [null, Validators.required],
      sku: [null, Validators.required],
      code: [null, Validators.required],
      price: [null, Validators.required],
      targetCount: [null, Validators.required]
    })])
  });

  hasUnitNumber = false;

  states = [
    {name: 'Alabama', abbreviation: 'AL'},
    {name: 'Alaska', abbreviation: 'AK'},
    {name: 'American Samoa', abbreviation: 'AS'},
    {name: 'Arizona', abbreviation: 'AZ'},
    {name: 'Arkansas', abbreviation: 'AR'},
    {name: 'California', abbreviation: 'CA'},
    {name: 'Colorado', abbreviation: 'CO'},
    {name: 'Connecticut', abbreviation: 'CT'},
    {name: 'Delaware', abbreviation: 'DE'},
    {name: 'District Of Columbia', abbreviation: 'DC'},
    {name: 'Federated States Of Micronesia', abbreviation: 'FM'},
    {name: 'Florida', abbreviation: 'FL'},
    {name: 'Georgia', abbreviation: 'GA'},
    {name: 'Guam', abbreviation: 'GU'},
    {name: 'Hawaii', abbreviation: 'HI'},
    {name: 'Idaho', abbreviation: 'ID'},
    {name: 'Illinois', abbreviation: 'IL'},
    {name: 'Indiana', abbreviation: 'IN'},
    {name: 'Iowa', abbreviation: 'IA'},
    {name: 'Kansas', abbreviation: 'KS'},
    {name: 'Kentucky', abbreviation: 'KY'},
    {name: 'Louisiana', abbreviation: 'LA'},
    {name: 'Maine', abbreviation: 'ME'},
    {name: 'Marshall Islands', abbreviation: 'MH'},
    {name: 'Maryland', abbreviation: 'MD'},
    {name: 'Massachusetts', abbreviation: 'MA'},
    {name: 'Michigan', abbreviation: 'MI'},
    {name: 'Minnesota', abbreviation: 'MN'},
    {name: 'Mississippi', abbreviation: 'MS'},
    {name: 'Missouri', abbreviation: 'MO'},
    {name: 'Montana', abbreviation: 'MT'},
    {name: 'Nebraska', abbreviation: 'NE'},
    {name: 'Nevada', abbreviation: 'NV'},
    {name: 'New Hampshire', abbreviation: 'NH'},
    {name: 'New Jersey', abbreviation: 'NJ'},
    {name: 'New Mexico', abbreviation: 'NM'},
    {name: 'New York', abbreviation: 'NY'},
    {name: 'North Carolina', abbreviation: 'NC'},
    {name: 'North Dakota', abbreviation: 'ND'},
    {name: 'Northern Mariana Islands', abbreviation: 'MP'},
    {name: 'Ohio', abbreviation: 'OH'},
    {name: 'Oklahoma', abbreviation: 'OK'},
    {name: 'Oregon', abbreviation: 'OR'},
    {name: 'Palau', abbreviation: 'PW'},
    {name: 'Pennsylvania', abbreviation: 'PA'},
    {name: 'Puerto Rico', abbreviation: 'PR'},
    {name: 'Rhode Island', abbreviation: 'RI'},
    {name: 'South Carolina', abbreviation: 'SC'},
    {name: 'South Dakota', abbreviation: 'SD'},
    {name: 'Tennessee', abbreviation: 'TN'},
    {name: 'Texas', abbreviation: 'TX'},
    {name: 'Utah', abbreviation: 'UT'},
    {name: 'Vermont', abbreviation: 'VT'},
    {name: 'Virgin Islands', abbreviation: 'VI'},
    {name: 'Virginia', abbreviation: 'VA'},
    {name: 'Washington', abbreviation: 'WA'},
    {name: 'West Virginia', abbreviation: 'WV'},
    {name: 'Wisconsin', abbreviation: 'WI'},
    {name: 'Wyoming', abbreviation: 'WY'}
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: JobOrdersService,
    private spinner: SpinnerService) {}

    ngOnInit() {
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
          jobOrder: {
            type: JobOrderType.External,
            status: JobOrderStatus.Pending,
            customerId: null,
            supplierId: null,
            warehouseId: null,
            productId: null,
            productVariations: [{
              name: '',
              price: 0,
              sku: '',
              code: '',
              targetCount: 0
            }]
          }
        }
      } else {
        if (this.pageMode === PageMode.Copy) {
          const ref = this.$db.ref().ref.doc();
          this.jobOrderItem.id = ref.id;
        }
      }

      this.jobOrderForm.setValue(this.jobOrderItem.jobOrder);
    }

    onSubmit() {
      if (!this.jobOrderForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.jobOrderItem.jobOrder = this.jobOrderForm.value;

      const errorFn = error => {
        console.log(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      //pre-proces data here
      // get supplier by id from suppliers
      // get warehouse by id from warehouses
      // get customer by id from customers
      // get product by id from products

      if (this.pageMode === PageMode.New || this.pageMode === PageMode.Copy) {
        this.$db.ref().doc(this.jobOrderItem.id).set(this.jobOrderItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.jobOrderItem.id).update(this.jobOrderItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['sales/job-orders']);
    }
}
