import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductCategoryListItem } from '../product-category-list/product-category-list-datasource';
import { Router } from '@angular/router';
import { ProductCategoriesService } from 'src/app/product-categories.service';
import * as firebase from 'firebase';
import { SpinnerService } from 'src/app/shared/spinner.service';

@Component({
  selector: 'app-product-category-detail',
  templateUrl: './product-category-detail.component.html',
  styleUrls: ['./product-category-detail.component.css']
})
export class ProductCategoryDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'ProductCategoryDetailComponent';
  productCategoryItem: ProductCategoryListItem;
  productCategoryForm = this.fb.group({
    name: [null, Validators.required],
    types: this.fb.array([this.fb.group({
      name: [null, Validators.required]
    })])
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: ProductCategoriesService,
    private spinner: SpinnerService) {}

  ngOnInit() {
    this.productCategoryItem = window.history.state;

    if (this.productCategoryItem.id === undefined && this.router.url !== '/products/categories/new') {
      this.back();
    }

    if (this.productCategoryItem.productCategory === undefined) {
      const ref = this.$db.ref().ref.doc();
      this.productCategoryItem = {
        id: ref.id,
        isActive: true,
        isDeleted: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        productCategory: {
          name: '',
          types: [{name: ''}]
        }
      }
      this.isNew = true;
    } else {
      const inputCount = this.productCategoryItem.productCategory.types.length - 1;
      if (inputCount) {
        for (let index = 1; index <= inputCount; index++) {
          this.createItem(this.productCategoryItem.productCategory.types[index]);
        }
      }
    }

    this.productCategoryForm.setValue(this.productCategoryItem.productCategory);
  }

  get types() {
    return this.productCategoryForm.get('types') as FormArray;
  }

  createItem(value = null) {
    this.types.push(this.fb.group({
      name: [value, Validators.required]
    }));
  }

  removeItem(index) {
    this.types.removeAt(index);
  }

  onSubmit() {
    if (!this.productCategoryForm.valid) { return; }

    this.spinner.show(this.spinnerName);
    this.productCategoryItem.productCategory = this.productCategoryForm.value;

    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    if (this.isNew) {
      this.$db.ref().doc(this.productCategoryItem.id).set(this.productCategoryItem).catch(errorFn).finally(finallyFn);
    } else {
      this.$db.ref().doc(this.productCategoryItem.id).update(this.productCategoryItem).catch(errorFn).finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['products/categories']);
  }
}
