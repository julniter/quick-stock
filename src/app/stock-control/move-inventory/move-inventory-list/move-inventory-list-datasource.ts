import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of as observableOf } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { OutletInventorySnapshot, WarehouseInventorySnapshot, MoveInventorySnapshot, MoveInventorySnapshotType } from 'src/app/inventory.model';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';

/**
 * Data source for the ProductList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class MoveInventoryListDataSource extends DataSource<MoveInventorySnapshot> {
  data: OutletInventorySnapshot[] = [];
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
  connect(): Observable<MoveInventorySnapshot[]> {
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
  private getPagedData(data: OutletInventorySnapshot[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  public getSource(data: MoveInventorySnapshot) {
    switch (data.type) {
      case MoveInventorySnapshotType.WarehouseToOutlet:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
        return (data.source as WarehouseListItem).warehouse.name;
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.OutletToWarehouse:
      default:
        return (data.source as OutletListItem).outlet.name;
    }
  }

  public getDestination(data: MoveInventorySnapshot) {
    switch (data.type) {
      case MoveInventorySnapshotType.OutletToWarehouse:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
        return (data.destination as WarehouseListItem).warehouse.name;
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.WarehouseToOutlet:
      default:
        return (data.destination as OutletListItem).outlet.name;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: MoveInventorySnapshot[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'date':
          return compare(
            a.createdAt,
            b.createdAt,
            isAsc
          );
        case 'source':
          return compare(
            this.getSource(a),
            this.getSource(b),
            isAsc
          );
        case 'destination':
          return compare(
            this.getDestination(a),
            this.getDestination(b),
            isAsc
          );
        case 'type':
          return compare(
            a.type,
            b.type,
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
