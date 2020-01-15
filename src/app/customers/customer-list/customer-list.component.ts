import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { CustomerListDataSource, CustomerListItem } from './customer-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { CustomersService } from 'src/app/customers.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<CustomerListItem>;
  dataSource: CustomerListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['company', 'contactName', 'emailAddress', 'mobile', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: CustomersService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new CustomerListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(customerItem: CustomerListItem) {
    this.router.navigate(['customers/', customerItem.customer.company, 'details'], { state: customerItem });
  }
}
