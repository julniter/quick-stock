import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Warehouses', cols: 4, rows: 1, routePath: ['./warehouses']  },
          { title: 'Outlets', cols: 4, rows: 1, routePath: ['./outlets']  },
          { title: 'Pricing', cols: 4, rows: 1, routePath: ['./pricings']  }
        ];
      }

      return [
        { title: 'Warehouses', cols: 1, rows: 1, routePath: ['./warehouses']  },
        { title: 'Outlets', cols: 1, rows: 1, routePath: ['./outlets']  },
        { title: 'Pricing', cols: 1, rows: 1, routePath: ['./pricings']  }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
