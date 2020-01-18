import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EmployeeListDataSource, EmployeeListItem } from './employee-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { EmployeesService } from 'src/app/setup-employees.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<EmployeeListItem>;
  dataSource: EmployeeListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'emailAddress', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: EmployeesService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new EmployeeListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(employeeItem: EmployeeListItem) {
    this.router.navigate(
      [
        'employees/',
        employeeItem.employee.firstName + ' ' + employeeItem.employee.lastName,
        'details'
      ],
      { state: employeeItem }
    );
  }
}
