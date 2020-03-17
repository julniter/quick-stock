import { Pipe, PipeTransform } from '@angular/core';
import { MoveInventorySnapshotStatus } from '../inventory.model';

@Pipe({
  name: 'moveInventorySnapshotStatusValue'
})
export class MoveInventorySnapshotStatusValuePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch(value) {
      case MoveInventorySnapshotStatus.InProgress:
        return MoveInventorySnapshotStatus[value];
      case MoveInventorySnapshotStatus.Received:
        return MoveInventorySnapshotStatus[value];
        case MoveInventorySnapshotStatus.Cancelled:
          return MoveInventorySnapshotStatus[value];
      case MoveInventorySnapshotStatus.Pending:
      default:
        return MoveInventorySnapshotStatus[MoveInventorySnapshotStatus.Pending];
    }
  }

}
