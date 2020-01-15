import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { OutletListDataSource, OutletListItem } from './outlet-list-datasource';
import { Subject } from 'rxjs';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { Router } from '@angular/router';
import { OutletsService } from 'src/app/setup-outlets.service';

@Component({
  selector: 'app-outlet-list',
  templateUrl: './outlet-list.component.html',
  styleUrls: ['./outlet-list.component.css']
})
export class OutletListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatTable, {static: false}) table: MatTable<OutletListItem>;
  dataSource: OutletListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'city', 'province', 'actions'];
  destroy$: Subject<void> = new Subject();

  constructor(private $db: OutletsService, private spinner: SpinnerService, private router: Router) {}

  ngOnInit() {
    this.dataSource = new OutletListDataSource(this.$db.ref().valueChanges(), this.spinner);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  view(outletItem: OutletListItem) {
    this.router.navigate(['setup/outlets/', outletItem.outlet.name, 'details'], { state: outletItem });
  }
}
