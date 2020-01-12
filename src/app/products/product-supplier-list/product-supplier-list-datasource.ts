import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { FirebaseMetaData } from 'src/app/firebase.meta';
import { SpinnerService } from 'src/app/shared/spinner.service';

export interface ProductSupplier {
  company: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobile: string;
  address: string;
  address2: string;
  city: string;
  province: string;
  postalCode: number;
}

// TODO: Replace this with your own data model type
export interface ProductSupplierListItem extends FirebaseMetaData {
  productSupplier: ProductSupplier;
}

/**
 * Data source for the ProductList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ProductSupplierListDataSource extends DataSource<ProductSupplierListItem> {
  data: ProductSupplierListItem[] = [];
  paginator: MatPaginator;
  sort: MatSort;

  constructor(private $db: Observable<any[]>, private spinner: SpinnerService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ProductSupplierListItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    this.spinner.show();
    this.$db.subscribe(d => {
      this.spinner.hide();
    });

    return this.$db;
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ProductSupplierListItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ProductSupplierListItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'company':
          return compare(
            a.productSupplier.company,
            b.productSupplier.company,
            isAsc
          );
        case 'contactName':
          return compare(
            a.productSupplier.firstName + ' ' + a.productSupplier.lastName,
            b.productSupplier.firstName + ' ' + b.productSupplier.lastName,
            isAsc
          );
        case 'emailAddress':
          return compare(
            a.productSupplier.emailAddress,
            b.productSupplier.emailAddress,
            isAsc
          );
        case 'mobile':
          return compare(
            a.productSupplier.mobile,
            b.productSupplier.mobile,
            isAsc
          );
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
