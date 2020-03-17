import { Pipe, PipeTransform } from '@angular/core';
import { MoveInventorySnapshotType } from '../inventory.model';

@Pipe({
  name: 'moveInventorySnapshotType'
})
export class MoveInventorySnapshotTypePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    switch (value) {
      case MoveInventorySnapshotType.OutletToWarehouse:
        return 'Outlet to Warehouse';
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return 'Warehouse to Outlet';
      case MoveInventorySnapshotType.WarehouseToWarehouse:
        return 'Warehouse to Warehouse';
      case MoveInventorySnapshotType.OutletToOutlet:
      default:
        return 'Outlet to Outlet';
    }
  }

}
