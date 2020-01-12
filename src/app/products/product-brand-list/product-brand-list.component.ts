import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ProductBrandListDataSource, ProductBrandListItem } from './product-brand-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { ProductBrandsService } from 'src/app/product-brands.service';

@Component({
  selector: 'app-product-brand-list',
  templateUrl: './product-brand-list.component.html',
  styleUrls: ['./product-brand-list.component.css']
})
export class ProductBrandListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<ProductBrandListItem>;
  dataSource: ProductBrandListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: ProductBrandsService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new ProductBrandListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(productBrandItem: ProductBrandListItem) {
    this.router.navigate(['products/brands/', productBrandItem.productBrand.name, 'details'], { state: productBrandItem });
  }
}
