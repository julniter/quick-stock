import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletSummaryDataSource } from './outlet-summary-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { OutletsService } from 'src/app/setup-outlets.service';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { InventoryService } from 'src/app/inventory.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { OutletInventorySnapshot } from 'src/app/inventory.model';
import { PdfReportsService } from 'src/app/shared/pdf-reports.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-outlet-summary',
  templateUrl: './outlet-summary.component.html',
  styleUrls: ['./outlet-summary.component.css']
})
export class OutletSummaryComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<OutletListItem>;
  dataSource: OutletSummaryDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['select', 'name', 'city', 'province'];
  destroy$: Subject<void> = new Subject();
  selection = new SelectionModel<OutletListItem>(true, []);

  constructor(
    private $db: OutletsService,
    private $dbInventory: InventoryService,
    private spinner: SpinnerService,
    private pdfService: PdfReportsService) {}

  ngOnInit() {
    this.dataSource = new OutletSummaryDataSource(this.$db.ref().valueChanges(), this.spinner);
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
    const outletIds = this.selection.selected.map(s => s.id);

    this.spinner.show();
    this.$dbInventory.getMultiLatestOutletSnapshot(outletIds).get().then(res => {
      const snapshots = res.docs.map(d => d.data()) as OutletInventorySnapshot[];
      this.generatePdf(snapshots);
    }).catch(error => {
      console.error(error);
    }).finally(() => {
      this.spinner.hide();
    });
  }

  generatePdf(snapshots: OutletInventorySnapshot[]) {
    const docDef = this.pdfService.getOutletSummaryDocDef(snapshots);
    pdfMake.createPdf(docDef).open();
   }

}
