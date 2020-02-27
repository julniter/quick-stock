import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WarehouseListItem } from '../warehouse-list/warehouse-list-datasource';
import { Router } from '@angular/router';
import { WarehousesService } from 'src/app/setup-warehouses.service';
import { SpinnerService } from 'src/app/shared/spinner.service';
import * as firebase from 'firebase';
import { PageMode } from 'src/app/firebase.meta';
import { provinces } from 'src/app/provinces';

@Component({
  selector: 'app-warehouse-detail',
  templateUrl: './warehouse-detail.component.html',
  styleUrls: ['./warehouse-detail.component.css']
})
export class WarehouseDetailComponent implements OnInit {
  provinces = provinces;
  spinnerName = 'WarehouseDetailComponent';
  pageMode = PageMode.New;
  warehouseItem: WarehouseListItem;
  warehouseForm = this.fb.group({
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
    private $db: WarehousesService,
    private spinner: SpinnerService) {}

    ngOnInit() {
      this.warehouseItem = window.history.state.item;
      this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

      if (this.warehouseItem.id === undefined && this.router.url !== '/setup/warehouses/new') {
        this.back();
      }

      if (this.warehouseItem.warehouse === undefined) {
        const ref = this.$db.ref().ref.doc();
        this.warehouseItem = {
          id: ref.id,
          isActive: true,
          isDeleted: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          warehouse: {
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
          this.warehouseItem.id = ref.id;
        }
      }

      this.warehouseForm.setValue(this.warehouseItem.warehouse);
    }

    onSubmit() {
      if (!this.warehouseForm.valid) { return; }

      this.spinner.show(this.spinnerName);
      this.warehouseItem.warehouse = this.warehouseForm.value;

      const errorFn = error => {
        console.log(error);
      };

      const finallyFn = () => {
        this.spinner.hide(this.spinnerName);
        this.back();
      };

      if (this.pageMode === PageMode.New || this.pageMode === PageMode.Copy) {
        this.$db.ref().doc(this.warehouseItem.id).set(this.warehouseItem).catch(errorFn).finally(finallyFn);
      } else {
        this.$db.ref().doc(this.warehouseItem.id).update(this.warehouseItem).catch(errorFn).finally(finallyFn);
      }
    }

    back() {
      this.router.navigate(['setup/warehouses']);
    }
}
