import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductSupplierListItem } from '../product-supplier-list/product-supplier-list-datasource';
import { Router } from '@angular/router';
import { ProductSuppliersService } from 'src/app/product-suppliers.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-product-supplier-detail',
  templateUrl: './product-supplier-detail.component.html',
  styleUrls: ['./product-supplier-detail.component.css']
})
export class ProductSupplierDetailComponent implements OnInit {
  isNew = false;
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
        console.log(error);
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
