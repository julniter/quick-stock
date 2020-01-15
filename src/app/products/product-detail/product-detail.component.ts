import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProductListItem } from '../product-list/product-list-datasource';
import { Router } from '@angular/router';
import { ProductBrandsService } from 'src/app/product-brands.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';

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
    private $db: ProductBrandsService,
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
            variants: [{ variant: '', variantValues: '' }]
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

      this.productForm.setValue(this.productItem.product);
    }

    get variants() {
      return this.productForm.get('variants') as FormArray;
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
