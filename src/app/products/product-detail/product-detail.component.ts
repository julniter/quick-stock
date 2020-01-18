import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductListItem, ProductVariation, ProductVariantSelection } from '../product-list/product-list-datasource';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/products.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { TitleCasePipe } from '@angular/common';

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
    private $db: ProductsService,
    private spinner: SpinnerService) {}

    ngOnInit() {
      this.productItem = window.history.state;

      if (this.productItem.id === undefined && this.router.url !== '/products/new') {
        this.back();
      }

      if (this.productItem.product === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.productItem = {
          id: ref.id,
          isActive: true,
          isDeleted: true,
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

      this.productForm.setValue(this.productItem.product);
    }

    get variants() {
      return this.productForm.get('variants') as FormArray;
    }

    get variations() {
      return this.productForm.get('variations') as FormArray;
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
      this.productItem.product = this.productForm.value;

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
}
