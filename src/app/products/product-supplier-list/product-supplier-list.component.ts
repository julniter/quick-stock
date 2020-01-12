import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ProductSupplierListDataSource, ProductSupplierListItem } from './product-supplier-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { ProductSuppliersService } from 'src/app/product-suppliers.service';

@Component({
  selector: 'app-product-supplier-list',
  templateUrl: './product-supplier-list.component.html',
  styleUrls: ['./product-supplier-list.component.css']
})
export class ProductSupplierListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<ProductSupplierListItem>;
  dataSource: ProductSupplierListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['company', 'contactName', 'emailAddress', 'mobile'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: ProductSuppliersService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new ProductSupplierListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(productSupplierItem: ProductSupplierListItem) {
    this.router.navigate(['products/brands/', productSupplierItem.productSupplier.company, 'details'], { state: productSupplierItem });
  }
}
