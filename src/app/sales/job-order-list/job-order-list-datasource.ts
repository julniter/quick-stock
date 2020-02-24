import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { FirebaseMetaData } from 'src/app/firebase.meta';
import { SpinnerService } from '../../shared/spinner.service';
import { CustomerListItem } from 'src/app/customers/customer-list/customer-list-datasource';
import { ProductListItem, ProductVariation } from 'src/app/products/product-list/product-list-datasource';
import { ProductSupplierListItem } from 'src/app/products/product-supplier-list/product-supplier-list-datasource';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';

export function getJobOrderTypes() {
  return [
    JobOrderType[JobOrderType.Internal],
    JobOrderType[JobOrderType.External]
  ];
}

export function getJobOrderStatus() {
  return [
    JobOrderStatus.Pending,
    JobOrderStatus.InProgress,
    JobOrderStatus.Received,
    JobOrderStatus.Delivered,
    JobOrderStatus.Cancelled
  ];
}

export enum JobOrderType {
  Internal,
  External
}

export enum JobOrderStatus {
  Pending,
  InProgress,
  Received,
  Delivered,
  Cancelled
}

export interface JobOrderProductVariation extends ProductVariation {
  targetCount: number;
  receivedCount?: number;
  deliveredCount?: number;
}

export interface JobOrder {
  type: JobOrderType;
  productId: string;
  productVariations: JobOrderProductVariation[];
  warehouseId: string;
  supplierId: string;
  customerId?: string;
}

// TODO: Replace this with your own data model type
export interface JobOrderListItem extends FirebaseMetaData {
  jobOrder: JobOrder;
  customer?: CustomerListItem;
  warehouse: WarehouseListItem;
  supplier: ProductSupplierListItem;
  product: ProductListItem;
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
        case 'id':
          return compare(
            a.id,
            b.id,
            isAsc
          );
        case 'supplier':
          return compare(
            a.supplier.productSupplier.company,
            b.supplier.productSupplier.company,
            isAsc
          );
        case 'product':
          return compare(
            a.product.product.name,
            b.product.product.name,
            isAsc
          );
        case 'warehouse':
          return compare(
            a.warehouse.warehouse.name,
            b.warehouse.warehouse.name,
            isAsc
          );
        case 'type':
          return compare(
            a.jobOrder.type,
            b.jobOrder.type,
            isAsc
          );
        case 'status':
          return compare(
            a.status,
            b.status,
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
