import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Job Orders', cols: 4, rows: 1, routePath: ['./job-orders'], icon: 'fa-clipboard' },
          { title: 'Outlet Sales', cols: 4, rows: 1, routePath: ['./outlet-sales'], icon: 'fa-chart-line' },
        ];
      }

      return [
        { title: 'Job Orders', cols: 1, rows: 1, routePath: ['./job-orders'], icon: 'fa-clipboard' },
        { title: 'Outlet Sales', cols: 1, rows: 1, routePath: ['./outlet-sales'], icon: 'fa-chart-line' },
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
