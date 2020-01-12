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
          { title: 'Outlets', cols: 4, rows: 1 },
          { title: 'Discounts', cols: 4, rows: 1 },
          { title: 'Tax', cols: 4, rows: 1 }
        ];
      }

      return [
        { title: 'Outlets', cols: 1, rows: 1 },
        { title: 'Discounts', cols: 1, rows: 1 },
        { title: 'Tax', cols: 1, rows: 1 }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
