import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

export enum DashboardWidgets {
  StockMonitoring,
  OutletPreview,
  WarehousePreview,
  ProductPreview
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Stock Monitoring', cols: 4, rows: 1, widget: DashboardWidgets.OutletPreview, icon: 'fa-chart-line' },
          { title: 'Outlets', cols: 4, rows: 1, widget: DashboardWidgets.OutletPreview, icon: 'fa-store' },
          { title: 'Warehouses', cols: 4, rows: 1, widget: DashboardWidgets.WarehousePreview, icon: 'fa-warehouse' },
          { title: 'Products', cols: 4, rows: 1, widget: DashboardWidgets.ProductPreview, icon: 'fa-boxes' },
        ];
      }

      return [
        { title: 'Stock Monitoring', cols: 2, rows: 1, widget: DashboardWidgets.OutletPreview, icon: 'fa-chart-line' },
        { title: 'Outlets', cols: 2, rows: 1, widget: DashboardWidgets.OutletPreview, icon: 'fa-store' },
        { title: 'Warehouses', cols: 2, rows: 1, widget: DashboardWidgets.WarehousePreview, icon: 'fa-warehouse' },
        { title: 'Products', cols: 2, rows: 1, widget: DashboardWidgets.ProductPreview, icon: 'fa-boxes' },
      ];
    })
  );

  outletPreviewWidget = DashboardWidgets.OutletPreview;
  warehousePreviewWidget = DashboardWidgets.WarehousePreview;
  productPreviewWidget = DashboardWidgets.ProductPreview;

  constructor(private breakpointObserver: BreakpointObserver) {}
}
