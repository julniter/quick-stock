import { Pipe, PipeTransform } from '@angular/core';
import { OutletSalesStatus } from './sales/outlet-sales-list/outlet-sales-list-datasource';

@Pipe({
  name: 'outletSalesStatus'
})
export class OutletSalesStatusPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch (value) {
      case OutletSalesStatus.Rejected:
        return OutletSalesStatus[OutletSalesStatus.Rejected];
      case OutletSalesStatus.Verified:
        return OutletSalesStatus[OutletSalesStatus.Verified];
      case OutletSalesStatus.Pending:
      default:
        return OutletSalesStatus[OutletSalesStatus.Pending];
    }
  }

}
