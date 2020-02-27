import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/shared/spinner.service';
import { ProductsService } from 'src/app/products.service';

@Component({
  selector: 'app-product-summary-result',
  templateUrl: './product-summary-result.component.html',
  styleUrls: ['./product-summary-result.component.css']
})
export class ProductSummaryResultComponent implements OnInit {

  constructor(private $db: ProductsService, private spinner: SpinnerService) {}

  ngOnInit() {}

}
