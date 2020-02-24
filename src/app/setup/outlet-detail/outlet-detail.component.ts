import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OutletListItem } from '../outlet-list/outlet-list-datasource';
import { Router } from '@angular/router';
import { OutletsService } from 'src/app/setup-outlets.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { PageMode } from 'src/app/firebase.meta';
import { provinces } from 'src/app/provinces';

@Component({
  selector: 'app-outlet-detail',
  templateUrl: './outlet-detail.component.html',
  styleUrls: ['./outlet-detail.component.css']
})
export class OutletDetailComponent implements OnInit {
  spinnerName = 'OutletDetailComponent';
  pageMode = PageMode.New;
  provinces = provinces;
  outletItem: OutletListItem;
  outletForm = this.fb.group({
    name: [null, Validators.required],
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
    private $db: OutletsService,
    private spinner: SpinnerService) {}

    ngOnInit() {
      this.outletItem = window.history.state.item;
      this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

      if (this.outletItem === undefined && this.router.url !== '/setup/outlets/new') {
        this.back();
      }

      if (this.outletItem === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.outletItem = {
          id: ref.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          outlet: {
            name: '',
            address: '',
            address2: '',
            city: '',
            province: '',
            postalCode: null
          }
        }
      } else {
        if (this.pageMode === PageMode.Copy) {
          const ref = this.$db.ref().ref.doc();
          this.outletItem.id = ref.id;
        }
      }

      this.outletForm.setValue(this.outletItem.outlet);
    }

    onSubmit() {
      if (!this.outletForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.outletItem.outlet = this.outletForm.value;

      const errorFn = error => {
        console.log(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      if (this.pageMode === PageMode.New || this.pageMode === PageMode.Copy) {
        this.$db.ref().doc(this.outletItem.id).set(this.outletItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.outletItem.id).update(this.outletItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['setup/outlets']);
    }
}
