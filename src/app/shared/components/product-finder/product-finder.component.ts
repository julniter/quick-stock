import { Component, OnInit, Input, Output,  EventEmitter, ViewChild } from '@angular/core';
import { ProductsService } from 'src/app/products.service';
import { SpinnerService } from '../../spinner.service';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import { BarcodeReaderComponent } from '../barcode-reader/barcode-reader.component';

export enum ProductFinderType {
  Select,
  Scan,
  Input
}

@Component({
  selector: 'app-product-finder',
  templateUrl: './product-finder.component.html',
  styleUrls: ['./product-finder.component.css']
})
export class ProductFinderComponent implements OnInit {

  @Input() productItems: ProductListItem[];
  @Output() productSelected = new EventEmitter<ProductListItem>();

  @ViewChild(BarcodeReaderComponent, {static: false})
  private barCodeReaderComponent: BarcodeReaderComponent;

  spinnerName = 'ProductFinderComponent';
  selectedInput = ProductFinderType.Select;
  selectedProduct: ProductListItem = null;

  productResultFromSelect: ProductListItem = null;
  productResultFromScan: ProductListItem = null;
  productResultFromInput: ProductListItem = null;

  constructor(private $db: ProductsService, private spinner: SpinnerService) {
  }

  ngOnInit(): void {
    if (this.productItems === undefined || this.productItems === null) {
      this.productItems = [];
    }
  }

  setSelectedFinder(productFinder: ProductFinderType) {
    this.selectedInput = productFinder;
    this.selectedProduct = this.getSelectedProduct();
  }

  emitSelectedPrduct() {
    this.productSelected.emit(this.getSelectedProduct());
    this.productResultFromInput = null;
    this.productResultFromScan = null;
    this.productResultFromSelect = null;
  }

  getSelectedProduct() {
    switch(this.selectedInput) {
      case ProductFinderType.Scan:
        return this.productResultFromScan;
      case ProductFinderType.Input:
        return this.productResultFromInput;
      case ProductFinderType.Select:
      default:
        return this.productResultFromSelect;
    }
  }

  findProductByCode(code: string) {
    return this.productItems.find(pi => pi.product.variations.find(v => v.code === code));
  }

  // For Select
  setSelectedProductFromSelect(productItem: ProductListItem) {
    this.productResultFromSelect = productItem;
  }

  // For Input
  setSelectedProductFromInput(code: string) {
    if (code.trim().length === 0) { return; }

    this.productResultFromInput = this.findProductByCode(code);
  }

  // For Scanner
  readBarcodeEmit(code: string) {
    const scannedProduct = this.findProductByCode(code);
    if (scannedProduct !== undefined) {
      this.productResultFromScan = scannedProduct;
      this.barCodeReaderComponent.stopScanning();
    }
  }

  clearSelectedProduct() {
    this.productResultFromInput = null;
    this.productResultFromScan = null;
    this.productResultFromSelect = null;
    this.selectedProduct = null;
  }

}
