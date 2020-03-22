import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Outlet Summary', cols: 4, rows: 1, routePath: ['./outlet-summary'], icon:'fa-chart-bar' },
          { title: 'Warehouse Summary', cols: 4, rows: 1, routePath: ['./warehouse-summary'], icon:'fa-chart-bar' },
          { title: 'Product Summary', cols: 4, rows: 1, routePath: ['./product-summary'], icon:'fa-chart-bar' },
          //{ title: 'Top Products', cols: 4, rows: 1, routePath: ['./top-products'], icon:'fa-chart-line' }
        ];
      }

      return [
        { title: 'Outlet Summary', cols: 1, rows: 1, routePath: ['./outlet-summary'], icon:'fa-chart-bar' },
        { title: 'Warehouse Summary', cols: 1, rows: 1, routePath: ['./warehouse-summary'], icon:'fa-chart-bar' },
        { title: 'Product Summary', cols: 1, rows: 1, routePath: ['./product-summary'], icon:'fa-chart-bar' },
        //{ title: 'Top Products', cols: 1, rows: 1, routePath: ['./top-products'], icon:'fa-chart-line' }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
