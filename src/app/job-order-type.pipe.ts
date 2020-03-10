import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jobOrderType'
})
export class JobOrderTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return null;
  }

}
