import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductListItem, ProductVariantSelection } from '../product-list/product-list-datasource';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/products.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';
import { ProductBrandsService } from 'src/app/product-brands.service';
import { ProductCategoriesService } from 'src/app/product-categories.service';
import { ProductVariantsService } from 'src/app/product-variants.service';
import { ProductCategoryListItem } from '../product-category-list/product-category-list-datasource';
import { ProductVariantListItem } from '../product-variant-list/product-variant-list-datasource';
import { ProductBrandListItem } from '../product-brand-list/product-brand-list-datasource';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'ProductDetailComponent';
  productItem: ProductListItem;
  productForm = this.fb.group({
    name: [null, Validators.required],
    brand: [null, Validators.required],
    type: [null, Validators.required],
    category: [null, Validators.required],
    description: [null, Validators.required],
    variants: this.fb.array([this.fb.group({
      variant: [null, Validators.required],
      variantValues: [null, Validators.required]
    })]),
    variations: this.fb.array([this.fb.group({
      name: [null, Validators.required],
      sku: [null, Validators.required],
      code: [null, Validators.required],
      price: [null, Validators.required]
    })])
  });

  brandItems: ProductBrandListItem[] = [];
  variantItems: ProductVariantListItem[] = [];
  categoryItems: ProductCategoryListItem[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: ProductsService,
    private spinner: SpinnerService,
    private $dbBrands: ProductBrandsService,
    private $dbVariants: ProductVariantsService,
    private $dbCategories: ProductCategoriesService) {}

    ngOnInit() {

      this.spinner.show(this.spinnerName);

      this.$dbBrands.ref().valueChanges().subscribe(items => {
        this.brandItems = items as any;
        this.hideSpinner();
      });

      this.$dbCategories.ref().valueChanges().subscribe(items => {
        this.categoryItems = items as any;
        this.hideSpinner();
      });

      this.$dbVariants.ref().valueChanges().subscribe(items => {
        this.variantItems = items as any;
        this.hideSpinner();
      });

      this.productItem = window.history.state;

      if (this.productItem.id === undefined && this.router.url !== '/products/new') {
        this.back();
      }

      if (this.productItem.product === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.productItem = {
          id: ref.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          product: {
            name: '',
            brand: '',
            category: '',
            type: '',
            description: '',
            variants: [{ variant: '', variantValues: '' }],
            variations: [{ name: '', price: 0, sku: '', code: '' }]
          }
        }
        this.isNew = true;
      } else {
        const inputCount = this.productItem.product.variants.length - 1;
        if (inputCount) {
          for (let index = 1; index <= inputCount; index++) {
            this.createItem(
              this.productItem.product.variants[index].variant,
              this.productItem.product.variants[index].variantValues
            );
          }
        }
      }

      this.variants.valueChanges.subscribe(v => {
        this.createVariations(v);
      });
      console.log(this.productItem.product);
      this.productForm.setValue(this.productItem.product);
    }

    private hideSpinner() {
      if (this.brandItems.length && this.variantItems.length && this.categoryItems.length) {
        this.spinner.hide(this.spinnerName);
      }
    }

    get variants() {
      return this.productForm.get('variants') as FormArray;
    }

    get variations() {
      return this.productForm.get('variations') as FormArray;
    }

    get category() {
      return this.productForm.get('category');
    }

    getTypes() {
      if (this.category.value) {
        const selectedCategoryItem = this.categoryItems.find(categoryItem => categoryItem.productCategory.name === this.category.value);
        if (selectedCategoryItem) {
          return selectedCategoryItem.productCategory.types;
        }
      }

      return [];
    }

    createItem(name = null, values = null) {
      this.variants.push(this.fb.group({
        variant: [name, Validators.required],
        variantValues: [values, Validators.required]
      }));
    }

    removeItem(index) {
      this.variants.removeAt(index);
    }

    createVariations(variants: ProductVariantSelection[]) {
      const productName = new TitleCasePipe().transform(this.productForm.get('name').value.trim());

      const tempVariationsValues = variants.map(vs => {
        if (vs.variantValues === null) { return []; }
        return vs.variantValues.split(',').map(vv => new TitleCasePipe().transform(vv.trim()));
      });

      this.variations.controls = [];
      this.createPermutation(tempVariationsValues).map(variation => {
        if (variation) {
          this.variations.push(this.fb.group({
            name: [{value: [productName, variation].join(' '), disabled: true }, Validators.required],
            sku: [null, Validators.required],
            code: [null, Validators.required],
            price: [null, Validators.required]
          }));
        }
      });

    }

    createPermutation(variationValues: string[][]): string[] {
      let tempPerp = [];
      variationValues.map((t, i) => {
        if (variationValues.length === 1) { tempPerp = variationValues[i]; }
        else if (i === variationValues.length - 1) { return; }
        else if (i === 0 ) { tempPerp = this.permutate(t, variationValues[i + 1]); }
        else { tempPerp = this.permutate(tempPerp, variationValues[i + 1]); }
      });
      return tempPerp;
    }

    permutate(a1, a2) {
      let temp = a1.slice().fill('', 0, a1.length);

      temp = temp.map((v, i) => {
        return a2.slice().map(a => {
          return [new TitleCasePipe().transform(a1[i].trim()), new TitleCasePipe().transform(a.trim())].join(' ');
        });
      }).flat();

      return temp;
    }

    onSubmit() {
      if (!this.productForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.productItem.product = this.productForm.getRawValue();

      const errorFn = error => {
        console.log(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      if (this.isNew) {
        this.$db.ref().doc(this.productItem.id).set(this.productItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.productItem.id).update(this.productItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['products/list']);
    }

    getControls() {
      return (this.productForm.get('variations') as FormArray).controls;
    }
}
