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
          { title: 'Starting Inventory', cols: 4, rows: 1, routePath: ['./starting-inventory'] },
          { title: 'Count Inventory', cols: 4, rows: 1, routePath: ['./starting-inventory'] },
        ];
      }

      return [
        { title: 'Starting Inventory', cols: 1, rows: 1, routePath: ['./starting-inventory'] },
        { title: 'Count Inventory', cols: 1, rows: 1, routePath: ['./starting-inventory'] },
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
