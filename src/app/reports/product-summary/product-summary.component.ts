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
import { PdfReportsService, ProductSummaryDataReport } from 'src/app/shared/pdf-reports.service';
import { first } from 'rxjs/operators';
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
    const filterSnapshot = (product: ProductListItem, snapshot: LocationInventorySnapshot []) => {
      return snapshot.map((s: OutletInventorySnapshot | WarehouseInventorySnapshot) => {
        s.snapshot.productInventory = s.snapshot.productInventory.filter(pi => pi.id === product.id);
        s.productIds = s.productIds.filter(pi => pi === product.id);
        return s;
      });
    };

    this.spinner.show();
    const lookUps = Promise.all(this.selection.selected.map(p => {
      return Promise.all([
        this.$dbInventory
        .queryProductFromOutletSnapshots(p.id)
        .then(outlets => {
          if (outlets.docs.length) {
            return outlets.docs.map(d => d.data()) as OutletInventorySnapshot[];
          } else {
            return [];
          }
        }),
        this.$dbInventory
        .queryProductFromWarehouseSnapshots(p.id)
        .then(warehouses => {
          if (warehouses.docs.length) {
            return warehouses.docs.map(d => d.data()) as WarehouseInventorySnapshot[];
          } else {
            return [];
          }
        })
      ])
      .then((response) => {
        const outletSnapshots = filterSnapshot(p, response[0]);
        const warehouseSnapshots = filterSnapshot(p, response[1]);

        return {
          product: p,
          outletSnapshots,
          warehouseSnapshots
        } as ProductSummaryDataReport;
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
    const docDef = this.pdfService.getProductSummaryDocDef(psd);
    pdfMake.createPdf(docDef).open();
   }

}
