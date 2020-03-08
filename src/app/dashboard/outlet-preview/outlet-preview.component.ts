import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletListDataSource, OutletListItem } from '../../setup/outlet-list/outlet-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { OutletsService } from 'src/app/setup-outlets.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-outlet-preview',
  templateUrl: './outlet-preview.component.html',
  styleUrls: ['./outlet-preview.component.css']
})
export class OutletPreviewComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<OutletListItem>;
  dataSource: OutletListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'city', 'province'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: OutletsService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new OutletListDataSource(this.$db.topFive().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  viewMore() {
    this.router.navigate(['setup', 'outlets']);
  }
}
