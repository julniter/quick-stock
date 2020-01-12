import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Product List', cols: 4, rows: 1, routePath: ['./list'] },
          { title: 'Stock Control', cols: 4, rows: 1, routePath: [] },
          { title: 'Product Categories', cols: 4, rows: 1, routePath: ['./categories'] },
          { title: 'Suppliers', cols: 4, rows: 1, routePath: ['./suppliers'] },
          { title: 'Brands', cols: 4, rows: 1, routePath: ['./brands'] }
        ];
      }

      return [
        { title: 'Product List', cols: 1, rows: 1, routePath: ['./list'] },
        { title: 'Stock Control', cols: 1, rows: 1, routePath: [] },
        { title: 'Product Categories', cols: 1, rows: 1, routePath: ['./categories'] },
        { title: 'Suppliers', cols: 1, rows: 1, routePath: ['./suppliers'] },
        { title: 'Brands', cols: 1, rows: 1, routePath: ['./brands'] }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) {}
}
