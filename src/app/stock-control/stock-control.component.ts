import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-stock-control',
  templateUrl: './stock-control.component.html',
  styleUrls: ['./stock-control.component.css']
})
export class StockControlComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Count Inventory', cols: 4, rows: 1, routePath: ['./count-inventory'], icon:'fa-boxes' },
          { title: 'Move Inventory', cols: 4, rows: 1, routePath: ['./move-inventory'], icon:'fa-truck-moving' },
          { title: 'Track Inventory', cols: 4, rows: 1, routePath: ['./track-inventory'], icon:'fa-dolly-flatbed' },
          { title: 'Product Look Up', cols: 4, rows: 1, routePath: ['./product-look-up'], icon:'fa-search' },
        ];
      }

      return [
        { title: 'Count Inventory', cols: 1, rows: 1, routePath: ['./count-inventory'], icon:'fa-boxes' },
        { title: 'Move Inventory', cols: 1, rows: 1, routePath: ['./move-inventory'], icon:'fa-truck-moving' },
        { title: 'Track Inventory', cols: 1, rows: 1, routePath: ['./track-inventory'], icon:'fa-dolly-flatbed' },
        { title: 'Product Look Up', cols: 1, rows: 1, routePath: ['./product-look-up'], icon:'fa-search' },
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
