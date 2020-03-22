import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/auth';
import { PermissionsService } from '../core/permissions/permissions.service';
import { EmployeeRoles, EmployeeListItem } from '../setup/employee-list/employee-list-datasource';
import { EmployeesService } from '../setup-employees.service';
import { SpinnerService } from '../shared/spinner.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  crumbs = '';
  parentLink = '';
  displayArrow = false;
  default = 'Quick Stock';
  defaultLink = ['authentication', 'login'];
  displayLogout = false;
  userRoles: EmployeeRoles[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private afAuthService: AngularFireAuth,
    private permissionService: PermissionsService,
    private $dbEmployees: EmployeesService,
    private spinner: SpinnerService
  ) {}

  ngOnInit() {
    this.afAuthService.authState.subscribe((authState) => {
      if (authState) {
        this.defaultLink = ['/dashboard'];
        this.displayLogout = true;

        this.spinner.show();
        this.$dbEmployees.ref().doc(authState.uid).get().toPromise().then((doc) => {
          this.userRoles = (doc.data() as EmployeeListItem).employee.roles;
          this.spinner.hide();
        });
      } else {
        this.defaultLink = ['authentication', 'login'];
        this.displayLogout = false;
        this.userRoles = [];
      }
    });

    this.setBreadCrumbs(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setBreadCrumbs(event.url);
      });
  }

  setBreadCrumbs(rawUrl: string) {
    this.crumbs = rawUrl.length
      ? rawUrl
          .substring(1)
          .split('/')
          .map((t) => {
            const word = t.split('');
            word.map((v, i) => {
              if (v === '-') {
                const temp  = t.split('');
                temp.splice(i, 1, ' ');
                t = temp.join('');
              }
            });
            return new TitleCasePipe().transform(decodeURIComponent(t));
          })
          .join(' / ')
      : this.default;
    this.displayArrow = this.crumbs.indexOf('/') !== -1;
    if (this.displayArrow) {
      this.parentLink = '/' + this.crumbs.split(' / ')[0].toLowerCase().replace(' ', '-');
    }
  }

  hasRole(path: string) {
    //if (this.userRoles.length === 0) { return false; }
    return this.permissionService.hasRole(path);//, this.userRoles);
  }
}
