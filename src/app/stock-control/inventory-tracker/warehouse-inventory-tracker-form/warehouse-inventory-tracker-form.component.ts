import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { WarehouseListItem } from 'src/app/setup/warehouse-list/warehouse-list-datasource';
import { InventoryService } from 'src/app/inventory.service';
import { WarehouseInventorySnapshot } from 'src/app/inventory.model';

@Component({
  selector: 'app-warehouse-inventory-tracker-form',
  templateUrl: './warehouse-inventory-tracker-form.component.html',
  styleUrls: ['./warehouse-inventory-tracker-form.component.css']
})
export class WarehouseInventoryTrackerFormComponent implements OnInit {
  isNew = false;
  spinnerName = 'WarehouseInventoryTrackerFormComponent';
  warehouseInventoryTrackerForm = this.fb.group({
    warehouseId: [null, Validators.required]
  });
  warehouseInventorySnapshot: WarehouseInventorySnapshot = null;

  @Input() warehouseItems: WarehouseListItem[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService) {}

  ngOnInit() { }

  get warehouseId() {
    return this.warehouseInventoryTrackerForm.get('warehouseId');
  }

  displayInventorySnapshot(warehouseSnapshots) {
    this.warehouseInventorySnapshot = warehouseSnapshots[0];
  }

  onSubmit() {
    if (this.warehouseInventoryTrackerForm.valid) {
      this.warehouseInventorySnapshot = null;
      this.spinner.show(this.spinnerName);

      const warehouseId = this.warehouseId.value;

      this.$db.getWarehouseSnapshots(warehouseId).then(res => {
        if (res.docs.length) {
          const warehouseSnapshots = res.docs.map(doc => doc.data() as WarehouseInventorySnapshot);
          this.displayInventorySnapshot(warehouseSnapshots);
        }
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        this.spinner.hide(this.spinnerName);
      });
    }
  }

  back() {
    this.router.navigate(['stock-control']);
  }
}
