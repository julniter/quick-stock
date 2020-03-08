import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ProductListDataSource, ProductListItem } from '../../products/product-list/product-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { ProductsService } from 'src/app/products.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-preview',
  templateUrl: './product-preview.component.html',
  styleUrls: ['./product-preview.component.css']
})
export class ProductPreviewComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<ProductListItem>;
  dataSource: ProductListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'brand', 'type'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: ProductsService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new ProductListDataSource(this.$db.topFive().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  viewMore() {
    this.router.navigate(['products', 'list']);
  }
}
