import { Pipe, PipeTransform } from '@angular/core';
import { InventorySnapshotStatus } from '../inventory.model';

@Pipe({
  name: 'inventorySnapshotStatus'
})
export class InventorySnapshotStatusPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch(value) {
      case InventorySnapshotStatus.Approved:
        return InventorySnapshotStatus[value];
      case InventorySnapshotStatus.Rejected:
        return InventorySnapshotStatus[value];
      case InventorySnapshotStatus.Pending:
      default:
        return InventorySnapshotStatus[InventorySnapshotStatus.Pending];
    }
  }

}
