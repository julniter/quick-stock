import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomerListItem } from '../customer-list/customer-list-datasource';
import { Router } from '@angular/router';
import { CustomersService } from 'src/app/customers.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { provinces } from 'src/app/provinces';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'CustomerDetailComponent';
  customerItem: CustomerListItem;
  customerForm = this.fb.group({
    company: [null, Validators.required],
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    emailAddress: [null, Validators.required],
    mobile: [null, Validators.required],
    address: [null, Validators.required],
    address2: null,
    city: [null, Validators.required],
    province: [null, Validators.required],
    postalCode: [null, Validators.compose([
      Validators.required, Validators.minLength(5), Validators.maxLength(5)])
    ]
  });

  hasUnitNumber = false;
  provinces = provinces;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: CustomersService,
    private spinner: SpinnerService) {}

    ngOnInit() {
      this.customerItem = window.history.state;

      if (this.customerItem.id === undefined && this.router.url !== '/customers/new') {
        this.back();
      }

      if (this.customerItem.customer === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.customerItem = {
          id: ref.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          customer: {
            company: '',
            firstName: '',
            lastName: '',
            emailAddress: '',
            mobile: '',
            address: '',
            address2: '',
            city: '',
            province: '',
            postalCode: null
          }
        }
        this.isNew = true;
      }

      this.customerForm.setValue(this.customerItem.customer);
    }

    onSubmit() {
      if (!this.customerForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.customerItem.customer = this.customerForm.value;

      const errorFn = error => {
        console.log(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      if (this.isNew) {
        this.$db.ref().doc(this.customerItem.id).set(this.customerItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.customerItem.id).update(this.customerItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['customers/list']);
    }
}
