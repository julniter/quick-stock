import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Customer List', cols: 4, rows: 1, routePath: ['./list']  }
        ];
      }

      return [
        { title: 'Customer List', cols: 1, rows: 1, routePath: ['./list']  }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
