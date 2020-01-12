import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductBrandListItem } from '../product-brand-list/product-brand-list-datasource';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { ProductBrandsService } from 'src/app/product-brands.service';

@Component({
  selector: 'app-product-brand-detail',
  templateUrl: './product-brand-detail.component.html',
  styleUrls: ['./product-brand-detail.component.css']
})
export class ProductBrandDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'ProductBrandDetailComponent';
  productBrandItem: ProductBrandListItem;
  productBrandForm = this.fb.group({
    name: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: ProductBrandsService,
    private spinner: SpinnerService) {}

  ngOnInit() {
    this.productBrandItem = window.history.state;

    if (this.productBrandItem.id === undefined && this.router.url !== '/products/brands/new') {
      this.back();
    }

    if (this.productBrandItem.productBrand === undefined) {
      const ref = this.$db.ref().ref.doc();
      this.productBrandItem = {
        id: ref.id,
        isActive: true,
        isDeleted: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        productBrand: {
          name: ''
        }
      }
      this.isNew = true;
    }

    this.productBrandForm.setValue(this.productBrandItem.productBrand);
  }

  onSubmit() {
    if (!this.productBrandForm.valid) { return; }

    this.spinner.show(this.spinnerName);
    this.productBrandItem.productBrand = this.productBrandForm.value;

    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    if (this.isNew) {
      this.$db.ref().doc(this.productBrandItem.id).set(this.productBrandItem).catch(errorFn).finally(finallyFn);
    } else {
      this.$db.ref().doc(this.productBrandItem.id).update(this.productBrandItem).catch(errorFn).finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['products/brands']);
  }
}
