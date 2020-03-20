import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ProductSummaryDataSource } from './product-summary-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { ProductsService } from 'src/app/products.service';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { InventoryService } from 'src/app/inventory.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { OutletInventorySnapshot, WarehouseInventorySnapshot, LocationInventorySnapshot } from 'src/app/inventory.model';
import { PdfReportsService, ProductSummaryDataReport, SummaryReportDateRange, DataRangedSummaryReport } from 'src/app/shared/pdf-reports.service';
import { first } from 'rxjs/operators';
import { groupBy, orderBy, map } from 'lodash';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.css']
})
export class ProductSummaryComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<ProductListItem>;
  dataSource: ProductSummaryDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['select', 'name', 'brand', 'type'];
  destroy$: Subject<void> = new Subject();
  selection = new SelectionModel<ProductListItem>(true, []);
  dateRange: SummaryReportDateRange = {
    fromDate: null,
    toDate: null
  };
  isValidDateRange = false;

  constructor(
    private $db: ProductsService,
    private $dbInventory: InventoryService,
    private spinner: SpinnerService,
    private pdfService: PdfReportsService) {}

  ngOnInit() {
    this.dataSource = new ProductSummaryDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onGenerateClick() {
    if (this.selection.selected.length === 0) { return; }

    const filterSnapshot = (product: ProductListItem, snapshot: LocationInventorySnapshot[], key: string) => {
      const groupedSnapshot = groupBy(snapshot, key);
      const latestSnapshots = map(groupedSnapshot, ((s: OutletInventorySnapshot[] | WarehouseInventorySnapshot[], keyId: string) => {
        return orderBy(s,
          (obj: OutletInventorySnapshot | WarehouseInventorySnapshot) =>
          { return obj.createdAt.toDate().getTime() },
          ['desc']
        )[0];
      }));

      return latestSnapshots.map((s: OutletInventorySnapshot | WarehouseInventorySnapshot) => {
        s.snapshot.productInventory = s.snapshot.productInventory.filter(pi => pi.id === product.id);
        s.productIds = s.productIds.filter(pi => pi === product.id);
        return s;
      });
    };

    const startDateLookup = new Date(
      this.dateRange.fromDate.getFullYear(),
      this.dateRange.fromDate.getMonth(),
      this.dateRange.fromDate.getDate() + 1
    );

    const startOutlet: OutletInventorySnapshot[] = [];
    const startWarehouse: WarehouseInventorySnapshot[] = [];

    this.spinner.show();
    const lookUps = Promise.all(this.selection.selected.map(p => {
      return Promise.all([
        this.$dbInventory
        .queryProductFromOutletSnapshotsWithDateRange(p.id, this.dateRange)
        .then(outlets => {
          return outlets.docs.length ? outlets.docs.map(d => d.data()) as OutletInventorySnapshot[] : [];
        }),
        this.$dbInventory
        .queryProductFromWarehouseSnapshotsWithDateRange(p.id, this.dateRange)
        .then(warehouses => {
          return warehouses.docs.length ? warehouses.docs.map(d => d.data()) as WarehouseInventorySnapshot[] : [];
        })
      ])
      .then((response) => {
        const outletSnapshots = filterSnapshot(p, response[0], 'outlet.id');
        const warehouseSnapshots = filterSnapshot(p, response[1], 'warehouse.id');

        return Promise.all([
          outletSnapshots.map((o: OutletInventorySnapshot) => {
            return this.$dbInventory.getOutletSnapshotsByDate(o.outlet.id, startDateLookup).then(res => {
              const starts = res.docs.length ? res.docs.map(d => d.data()) as OutletInventorySnapshot[] : [];
              if (starts.length) {
                startOutlet.push(starts[0]);
              }
              return starts;
            });
          }),
          warehouseSnapshots.map((w: WarehouseInventorySnapshot) => {
            return this.$dbInventory.getOutletSnapshotsByDate(w.warehouse.id, startDateLookup).then(res => {
              const starts = res.docs.length ? res.docs.map(d => d.data()) as WarehouseInventorySnapshot[] : [];
              if (starts.length) {
                startWarehouse.push(starts[0]);
              }
              return starts;
            });
          })
        ]).then(res => {

          const outletDataSummary = outletSnapshots.map(snaps => {
            return {
              dateRange: this.dateRange,
              startSnapshot: startOutlet.find(f => f.outlet.id === snaps.outlet.id),
              endSnapshot: snaps
            } as DataRangedSummaryReport;
          });

          const warehouseDataSummary = warehouseSnapshots.map(snaps => {
            return {
              dateRange: this.dateRange,
              startSnapshot: startWarehouse.find(f => f.warehouse.id === snaps.warehouse.id),
              endSnapshot: snaps
            } as DataRangedSummaryReport;
          });

          return {
            product: p,
            outletSnapshots: outletDataSummary,
            warehouseSnapshots: warehouseDataSummary
          } as ProductSummaryDataReport;
        });
      })
      .catch(error => {
        console.error(error);
      });
    }));

    lookUps.then((response: ProductSummaryDataReport[]) => {
      this.generatePdf(response);
      return response;
    })
    .catch(error => {
      console.error(error);
    })
    .finally(() => {
      this.spinner.hide();
    });

  }

  generatePdf(psd: ProductSummaryDataReport[]) {
    const docDef = this.pdfService.getProductSummaryDocDef(psd, this.dateRange);
    pdfMake.createPdf(docDef).open();
  }

  onFromDateChanged($event) {
    this.dateRange.fromDate = $event.value;
    this.validateDateRange();
  }

  onToDateChanged($event) {
    this.dateRange.toDate = $event.value;
    this.validateDateRange();
  }

  validateDateRange() {
    if (this.dateRange.fromDate && this.dateRange.toDate) {
      this.isValidDateRange = this.dateRange.toDate.getTime() > this.dateRange.fromDate.getTime();
    } else {
      this.isValidDateRange = false;
    }
  }

}
