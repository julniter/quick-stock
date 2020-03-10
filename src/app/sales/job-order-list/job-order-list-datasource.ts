import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { FirebaseMetaData } from 'src/app/firebase.meta';
import { SpinnerService } from '../../shared/spinner.service';
import { ProductInventoryItem } from 'src/app/inventory.model';
import { CustomerListItem } from 'src/app/customers/customer-list/customer-list-datasource';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';

export enum JobOrderStock {
  New,
  Existing
}

export enum JobOrderStatus {
  Pending,
  InProgress,
  Received,
  Delivered,
  Cancelled
}

export enum JobOrderType {
  Internal,
  External
}

export interface JobOrder {
  referenceNumber: number;
  warehouseId: string;
  customerId?: string;
  products: ProductInventoryItem[];
  type: JobOrderType;
  stock: JobOrderStock;
}

// TODO: Replace this with your own data model type
export interface JobOrderListItem extends FirebaseMetaData {
  productIds: string[];
  jobOrder: JobOrder;
  warehouse: WarehouseListItem;
  customer?: CustomerListItem;
  status: JobOrderStatus;
}

/**
 * Data source for the ProductList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class JobOrderListDataSource extends DataSource<JobOrderListItem> {
  data: JobOrderListItem[] = [];
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
  connect(): Observable<JobOrderListItem[]> {
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
  private getPagedData(data: JobOrderListItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: JobOrderListItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'referenceNumber':
          return compare(
            a.jobOrder.referenceNumber,
            b.jobOrder.referenceNumber,
            isAsc
          );
        case 'warehouse':
          return compare(
            a.warehouse.warehouse.name,
            b.warehouse.warehouse.name,
            isAsc
          );
        case 'Type':
          return compare(
            JobOrderType[a.jobOrder.type],
            JobOrderType[b.jobOrder.type],
            isAsc
          );
        case 'status':
          return compare(
            JobOrderStatus[a.status],
            JobOrderStatus[b.status],
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
