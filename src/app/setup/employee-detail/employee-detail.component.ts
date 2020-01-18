import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { EmployeeListItem } from '../employee-list/employee-list-datasource';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { EmployeesService } from 'src/app/setup-employees.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  isNew = false;
  spinnerName = 'EmployeeDetailComponent';
  employeeItem: EmployeeListItem;
  employeeForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    emailAddress: [null, Validators.required],
    password: [null, [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: EmployeesService,
    private spinner: SpinnerService) {}

  ngOnInit() {
    this.employeeItem = window.history.state;

    if (this.employeeItem.id === undefined && this.router.url !== '/setup/employees/new') {
      this.back();
    }

    if (this.employeeItem.employee === undefined) {
      const ref = this.$db.ref().ref.doc();
      this.employeeItem = {
        id: ref.id,
        isActive: true,
        isDeleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        employee: {
          firstName: '',
          lastName: '',
          emailAddress: '',
          password: ''
        }
      };
      this.isNew = true;
    }

    this.employeeForm.setValue(this.employeeItem.employee);
  }

  onSubmit() {
    if (!this.employeeForm.valid) { return; }

    this.spinner.show(this.spinnerName);
    this.employeeItem.employee = this.employeeForm.value;

    const errorFn = error => {
      console.log(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    if (this.isNew) {
      this.$db.ref().doc(this.employeeItem.id).set(this.employeeItem).catch(errorFn).finally(finallyFn);
    } else {
      this.$db.ref().doc(this.employeeItem.id).update(this.employeeItem).catch(errorFn).finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['setup/employees']);
  }
}
