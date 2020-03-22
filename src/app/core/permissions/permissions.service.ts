import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { EmployeeRoles, EmployeeListItem } from 'src/app/setup/employee-list/employee-list-datasource';
import { EmployeesService } from 'src/app/setup-employees.service';
import { environment } from 'src/environments/environment';
import { uniq } from 'lodash';
import { SpinnerService } from 'src/app/shared/spinner.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  isLoggedIn = false;
  userRoles: EmployeeRoles[] = [];
  rolesPrmomise: Promise<EmployeeRoles[]>;

  private rolesToRoutes: any;

  constructor(private afAuthService: AngularFireAuth, private $dbEmployees: EmployeesService, private spinner: SpinnerService) {

    this.rolesToRoutes = environment.rolesToMapping;

    this.afAuthService.authState.subscribe((authState) => {
      if (authState !== null) {

        this.spinner.show();
        this.rolesPrmomise = this.$dbEmployees.ref().doc(authState.uid).get().toPromise().then(doc => {
          const employee = doc.data() as EmployeeListItem;
          this.userRoles = employee.employee.roles;
          return this.userRoles;
        }).finally(() => {
          this.spinner.hide();
        });

        this.isLoggedIn = true;
      } else {
        this.resetAuthState();
      }

    });
  }

  resetAuthState() {
    this.isLoggedIn = false;
    this.userRoles = [];
  }

  public hasRole(path: string, userRoles: EmployeeRoles[] = []): boolean {
    return uniq(this.getRoutes(userRoles)).find(r => r === path) !== undefined;
  }

  getRoutes(userRoles: EmployeeRoles[] = []) {
    const routes = [];

    if (userRoles.length === 0) {
      this.userRoles.map(r => {
        routes.push(...this.rolesToRoutes[r]);
      });
    } else {
      userRoles.map(r => {
        routes.push(...this.rolesToRoutes[r]);
      });
    }
    return routes;
  }

}
