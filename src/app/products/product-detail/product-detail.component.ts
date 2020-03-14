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
    variants: this.fb.array([]),
    variations: this.fb.array([])
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

    get variants() {
      return this.productForm.get('variants') as FormArray;
    }

    get variations() {
      return this.productForm.get('variations') as FormArray;
    }

    get category() {
      return this.productForm.get('category');
    }

    ngOnInit() {

      this.spinner.show(this.spinnerName);

      this.productItem = window.history.state;

      if (this.productItem.id === undefined && this.router.url !== '/products/new') {
        this.back();
      } else {

        Promise.all([
          this.$dbBrands.ref().ref.where('isDeleted', '==', false).get().then(items => {
            this.brandItems = items.docs.length ? items.docs.map(d => d.data()) as any : [];
          }),
          this.$dbCategories.ref().ref.where('isDeleted', '==', false).get().then(items => {
            this.categoryItems = items.docs.length ? items.docs.map(d => d.data()) as any : [];
          }),
          this.$dbVariants.ref().ref.where('isDeleted', '==', false).get().then(items => {
            this.variantItems = items.docs.length ? items.docs.map(d => d.data()) as any : [];
          })
        ]).finally(() => {
          this.spinner.hide(this.spinnerName);
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
                variants: [],
                variations: []
              }
            };
            this.isNew = true;
          }

          this.productForm.setValue(Object.assign({...this.productItem.product}, {variants: [], variations: []}));
          this.productItem.product.variants.map((v, i) => {
            this.createItem(v.variant, v.variantValues);
          });
          this.productItem.product.variations.map((v, i) => {
            this.createVariationGroup('', v.name, v.sku, v.code, v.price);
          });

          this.productForm.get('name').valueChanges.subscribe(v => {
            this.updateVaritions();
          });
        });
      }
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

    updateVaritions() {
      this.createVariations(this.variants.getRawValue());
    }

    createItem(name = null, values = null) {
      const variantGroup = this.fb.group({
        variant: [name, Validators.required],
        variantValues: [values, Validators.required]
      });

      variantGroup.get('variantValues').valueChanges.subscribe(v => {
        this.updateVaritions();
      });

      this.getControlsVariants().push(variantGroup);
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
          this.createVariationGroup(productName, variation);
        }
      });
    }

    createVariationGroup(productName, variation, sku = null, code = null, price = null) {
      this.variations.push(this.fb.group({
        name: [{value: [productName, variation].join(' '), disabled: true }, Validators.required],
        sku: [sku, Validators.required],
        code: [code, Validators.required],
        price: [price, Validators.required]
      }));
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

    getControlsVariants() {
      return (this.productForm.get('variants') as FormArray).controls;
    }

    getControls() {
      return (this.productForm.get('variations') as FormArray).controls;
    }
}
