import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { EmployeeListItem, EmployeeRoles, getEmployeeRoleList } from '../employee-list/employee-list-datasource';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { EmployeesService } from 'src/app/setup-employees.service';
import { PageMode } from 'src/app/firebase.meta';
import { MatDialog } from '@angular/material';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  isNew = false;
  spinnerName = 'EmployeeDetailComponent';
  employeeItem: EmployeeListItem;
  employeeForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    emailAddress: [null, Validators.required],
    password: [null, [Validators.required, Validators.minLength(6)]],
    roles: [null, [Validators.required]],
  });
  secondaryApp: any;
  pageMode = PageMode.New;
  roleList: EmployeeRoles[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: EmployeesService,
    private spinner: SpinnerService,
    public dialog: MatDialog) {}

  ngOnInit() {

    this.roleList = getEmployeeRoleList();

    const config = {
      apiKey: 'AIzaSyAflsLMrOEW9v7y7Y_6UgXDSI14-HVNk58',
      authDomain: 'quickstock-5bc62.firebaseapp.com',
      databaseURL: 'https://quickstock-5bc62.firebaseio.com',
      projectId: 'quickstock-5bc62',
      storageBucket: 'quickstock-5bc62.appspot.com',
      messagingSenderId: '1029697272176',
      appId: '1:1029697272176:web:90bf1532010c9f3e9737b5',
      measurementId: 'G-K57QQC197E'
    };

    if (firebase.apps.length === 1) {
      this.secondaryApp = firebase.initializeApp(config, 'DummyReference');
    } else {
      this.secondaryApp = firebase.app('DummyReference');
    }

    this.employeeItem = window.history.state.item;
    this.pageMode = window.history.state.pageMode !== undefined ? window.history.state.pageMode : this.pageMode;

    if (this.employeeItem === undefined && this.router.url !== '/setup/employees/new') {
      this.back();
    }

    if (this.employeeItem === undefined) {
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
          password: '',
          roles: []
        }
      };
      this.isNew = true;
    } else {
      this.employeeForm.get('password').disable();
      this.employeeForm.get('emailAddress').disable();
    }

    this.employeeForm.setValue(this.employeeItem.employee);
  }

  ngOnDestroy() {
    this.secondaryApp.delete();
  }

  get roles() {
    return this.employeeForm.get('roles');
  }

  getRoleLabels() {
    if (this.roles.value) {
      return this.roles.value.map(i => {
        return this.roleList[i];
      }).join(', ');
    } else {
      return null;
    }
  }

  onSubmit() {
    if (!this.employeeForm.valid) { return; }

    this.spinner.show(this.spinnerName);
    this.employeeItem.employee = this.employeeForm.getRawValue();

    const errorFn = error => {
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    if (this.isNew) {
      this.secondaryApp.auth()
      .createUserWithEmailAndPassword(
        this.employeeItem.employee.emailAddress,
        this.employeeItem.employee.password)
      .then((userAuth) => {
        this.employeeItem.id = userAuth.user.uid;
        this.secondaryApp.auth().signOut();
        return this.$db.ref().doc(this.employeeItem.id).set(this.employeeItem);
      }).catch(errorFn).finally(finallyFn);
    } else {
      this.$db.ref().doc(this.employeeItem.id).update(this.employeeItem).catch(errorFn).finally(finallyFn);
    }
  }

  back() {
    this.router.navigate(['setup/employees']);
  }

  deleteAccount() {
    const errorFn = error => {
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide(this.spinnerName);
      this.back();
    };

    const dialogRef = this.dialog.open(
      DeleteDialogComponent, {
        maxWidth: 300,
        data: {
          header: 'Employees',
          message: 'account for ' + this.employeeItem.employee.emailAddress
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result !== true) { return; }

      this.spinner.show(this.spinnerName);
      Promise.all([
        this.secondaryApp
        .auth()
        .signInWithEmailAndPassword(
          this.employeeItem.employee.emailAddress,
          this.employeeItem.employee.password)
        .then((userAuth) => {
          userAuth.user.delete();
          this.secondaryApp.auth().signOut();
        }),
        this.$db.ref().doc(this.employeeItem.id).delete()
      ]).catch(errorFn).finally(finallyFn);
    });
  }
}
