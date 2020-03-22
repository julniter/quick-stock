import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductSupplierListItem } from '../product-supplier-list/product-supplier-list-datasource';
import { Router } from '@angular/router';
import { ProductSuppliersService } from 'src/app/product-suppliers.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { provinces } from 'src/app/provinces';

@Component({
  selector: 'app-product-supplier-detail',
  templateUrl: './product-supplier-detail.component.html',
  styleUrls: ['./product-supplier-detail.component.css']
})
export class ProductSupplierDetailComponent implements OnInit {
  isNew = false;
  provinces = provinces;
  spinnerName = 'ProductSupplierDetailComponent';
  productSupplierItem: ProductSupplierListItem;
  productSupplierForm = this.fb.group({
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: ProductSuppliersService,
    private spinner: SpinnerService) {}

    ngOnInit() {
      this.productSupplierItem = window.history.state;

      if (this.productSupplierItem.id === undefined && this.router.url !== '/products/suppliers/new') {
        this.back();
      }

      if (this.productSupplierItem.productSupplier === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.productSupplierItem = {
          id: ref.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          productSupplier: {
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

      this.productSupplierForm.setValue(this.productSupplierItem.productSupplier);
    }

    onSubmit() {
      if (!this.productSupplierForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.productSupplierItem.productSupplier = this.productSupplierForm.value;

      const errorFn = error => {
        console.error(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      if (this.isNew) {
        this.$db.ref().doc(this.productSupplierItem.id).set(this.productSupplierItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.productSupplierItem.id).update(this.productSupplierItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['products/suppliers']);
    }
}
