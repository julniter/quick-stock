import { Pipe, PipeTransform } from '@angular/core';
import { JobOrderStatus } from '../sales/job-order-list/job-order-list-datasource';

@Pipe({
  name: 'jobOrderStatusValue'
})
export class JobOrderStatusValuePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch(value) {
      case JobOrderStatus.Pending:
        return JobOrderStatus[JobOrderStatus.Pending];
      case JobOrderStatus.Received:
        return JobOrderStatus[JobOrderStatus.Received];
      case JobOrderStatus.Cancelled:
        return JobOrderStatus[JobOrderStatus.Cancelled];
      case JobOrderStatus.Delivered:
        return JobOrderStatus[JobOrderStatus.Delivered];
      case JobOrderStatus.InProgress:
        return JobOrderStatus[JobOrderStatus.InProgress];
      default:
        return '--';
    }
  }

}
