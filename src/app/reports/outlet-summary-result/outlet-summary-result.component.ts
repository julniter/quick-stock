import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { OutletsService } from 'src/app/setup-outlets.service';

@Component({
  selector: 'app-outlet-summary-result',
  templateUrl: './outlet-summary-result.component.html',
  styleUrls: ['./outlet-summary-result.component.css']
})
export class OutletSummaryResultComponent implements OnInit {

  constructor(private $db: OutletsService, private spinner: SpinnerService) {}

  ngOnInit() {}

}
