import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { PricingListItem } from '../pricing-list/pricing-list-datasource';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { PricingsService } from 'src/app/setup-pricings.service';

@Component({
  selector: 'app-pricing-detail',
  templateUrl: './pricing-detail.component.html',
  styleUrls: ['./pricing-detail.component.css']
})
export class PricingDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'PricingDetailComponent';
  pricingItem: PricingListItem;
  pricingForm = this.fb.group({
    name: [null, Validators.required],
    tax: [null, Validators.required],
    discount: [null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: PricingsService,
    private spinner: SpinnerService) {}

  ngOnInit() {
    this.pricingItem = window.history.state;

    if (this.pricingItem.id === undefined && this.router.url !== '/setup/pricings/new') {
      this.back();
    }

    if (this.pricingItem.pricing === undefined) {
      const ref = this.$db.ref().ref.doc();
      this.pricingItem = {
        id: ref.id,
        isActive: true,
        isDeleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        pricing: {
          name: '',
          tax: null,
          discount: null
        }
      }
      this.isNew = true;
    }

    this.pricingForm.setValue(this.pricingItem.pricing);
  }

  onSubmit() {
    if (!this.pricingForm.valid) { return; }

    this.spinner.show(this.spinnerName);
    this.pricingItem.pricing = this.pricingForm.value;

    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    if (this.isNew) {
      this.$db.ref().doc(this.pricingItem.id).set(this.pricingItem).catch(errorFn).finally(finallyFn);
    } else {
      this.$db.ref().doc(this.pricingItem.id).update(this.pricingItem).catch(errorFn).finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['setup/pricings']);
  }
}
