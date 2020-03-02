import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { OutletListItem } from 'src/app/setup/outlet-list/outlet-list-datasource';
import { InventoryService } from 'src/app/inventory.service';
import { OutletInventorySnapshot } from 'src/app/inventory.model';

@Component({
  selector: 'app-outlet-inventory-tracker-form',
  templateUrl: './outlet-inventory-tracker-form.component.html',
  styleUrls: ['./outlet-inventory-tracker-form.component.css']
})
export class OutletInventoryTrackerFormComponent implements OnInit {
  isNew = false;
  spinnerName = 'OutletInventoryTrackerFormComponent';
  outletInventoryTrackerForm = this.fb.group({
    outletId: [null, Validators.required]
  });
  outletInventorySnapshot: OutletInventorySnapshot = null;

  @Input() outletItems: OutletListItem[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private $db: InventoryService,
    private spinner: SpinnerService) {}

  ngOnInit() { }

  get outletId() {
    return this.outletInventoryTrackerForm.get('outletId');
  }

  displayInventorySnapshot(outletSnapshots) {
    console.log(outletSnapshots);
    this.outletInventorySnapshot = outletSnapshots[0];
  }

  onSubmit() {
    console.log(this.outletInventoryTrackerForm);

    if (this.outletInventoryTrackerForm.valid) {
      this.outletInventorySnapshot = null;
      this.spinner.show(this.spinnerName);

      const outletId = this.outletId.value;

      this.$db.getOutletSnapshots(outletId).then(res => {
        if (res.docs.length) {
          const outletSnapshots = res.docs.map(doc => doc.data() as OutletInventorySnapshot);
          this.displayInventorySnapshot(outletSnapshots);
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
