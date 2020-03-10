import { Pipe, PipeTransform } from '@angular/core';
import { JobOrderType } from '../sales/job-order-list/job-order-list-datasource';

@Pipe({
  name: 'jobOrderTypeValue'
})
export class JobOrderTypeValuePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch(value) {
      case JobOrderType.Internal:
        return JobOrderType[value];
      case JobOrderType.External:
        return JobOrderType[value];
      default:
        return '--';
    }
  }

}
