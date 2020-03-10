import { Pipe, PipeTransform } from '@angular/core';
import { JobOrderStatus } from '../sales/job-order-list/job-order-list-datasource';

@Pipe({
  name: 'jobOrderStatusValue'
})
export class JobOrderStatusValuePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch(value) {
      case JobOrderStatus.Received:
        return JobOrderStatus[value];
      case JobOrderStatus.Cancelled:
        return JobOrderStatus[value];
      case JobOrderStatus.Delivered:
        return JobOrderStatus[value];
      case JobOrderStatus.InProgress:
        return JobOrderStatus[value];
      case JobOrderStatus.Pending:
      default:
        return JobOrderStatus[JobOrderStatus.Pending];
    }
  }

}
