import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductVariantListItem } from '../product-variant-list/product-variant-list-datasource';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { ProductVariantsService } from 'src/app/product-variants.service';

@Component({
  selector: 'app-product-variant-detail',
  templateUrl: './product-variant-detail.component.html',
  styleUrls: ['./product-variant-detail.component.css']
})
export class ProductVariantDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'ProductVariantDetailComponent';
  productVariantItem: ProductVariantListItem;
  productVariantForm = this.fb.group({
    name: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: ProductVariantsService,
    private spinner: SpinnerService) {}

  ngOnInit() {
    this.productVariantItem = window.history.state;

    if (this.productVariantItem.id === undefined && this.router.url !== '/products/variants/new') {
      this.back();
    }

    if (this.productVariantItem.productVariant === undefined) {
      const ref = this.$db.ref().ref.doc();
      this.productVariantItem = {
        id: ref.id,
        isActive: true,
        isDeleted: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        productVariant: {
          name: ''
        }
      }
      this.isNew = true;
    }

    this.productVariantForm.setValue(this.productVariantItem.productVariant);
  }

  onSubmit() {
    if (!this.productVariantForm.valid) { return; }

    this.spinner.show(this.spinnerName);
    this.productVariantItem.productVariant = this.productVariantForm.value;

    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    if (this.isNew) {
      this.$db.ref().doc(this.productVariantItem.id).set(this.productVariantItem).catch(errorFn).finally(finallyFn);
    } else {
      this.$db.ref().doc(this.productVariantItem.id).update(this.productVariantItem).catch(errorFn).finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['products/variants']);
  }
}
