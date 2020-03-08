import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { FirebaseMetaData } from 'src/app/firebase.meta';
import { SpinnerService } from '../../shared/spinner.service';
import { OutletInventorySnapshot } from 'src/app/inventory.model';

export enum OutletSalesStatus {
  Pending,
  Verified,
  Rejected
}

// TODO: Replace this with your own data model type
export interface OutletSalesListItem extends FirebaseMetaData {
  outletInventorySnapshot: OutletInventorySnapshot;
  status: OutletSalesStatus;
}

/**
 * Data source for the ProductList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class OutletSalesListDataSource extends DataSource<OutletSalesListItem> {
  data: OutletSalesListItem[] = [];
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
  connect(): Observable<OutletSalesListItem[]> {
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
  private getPagedData(data: OutletSalesListItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: OutletSalesListItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'name':
          return compare(
            a.outletInventorySnapshot.outlet.outlet.name,
            b.outletInventorySnapshot.outlet.outlet.name,
            isAsc
          );
          case 'status':
            return compare(
              OutletSalesStatus[a.status],
              OutletSalesStatus[b.status],
              isAsc
            );
        case 'createdAt':
          return compare(
            a.createdAt,
            b.createdAt,
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
