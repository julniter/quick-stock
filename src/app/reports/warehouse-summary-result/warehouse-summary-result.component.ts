import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { WarehousesService } from 'src/app/setup-warehouses.service';

@Component({
  selector: 'app-warehouse-summary-result',
  templateUrl: './warehouse-summary-result.component.html',
  styleUrls: ['./warehouse-summary-result.component.css']
})
export class WarehouseSummaryResultComponent implements OnInit {

  constructor(private $db: WarehousesService, private spinner: SpinnerService) {}

  ngOnInit() {}

}
