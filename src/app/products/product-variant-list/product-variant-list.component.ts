import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ProductVariantListDataSource, ProductVariantListItem } from './product-variant-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { ProductVariantsService } from 'src/app/product-variants.service';

@Component({
  selector: 'app-product-variant-list',
  templateUrl: './product-variant-list.component.html',
  styleUrls: ['./product-variant-list.component.css']
})
export class ProductVariantListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<ProductVariantListItem>;
  dataSource: ProductVariantListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: ProductVariantsService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new ProductVariantListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(productVariantItem: ProductVariantListItem) {
    this.router.navigate(['products/variants/', productVariantItem.productVariant.name, 'details'], { state: productVariantItem });
  }
}
