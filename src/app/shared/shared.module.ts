import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { NgxSpinnerModule } from 'ngx-spinner';
import { JobOrderTypeValuePipe } from '../job-order-type-value/job-order-type-value.pipe';
import { JobOrderStatusValuePipe } from '../job-order-status-value/job-order-status-value.pipe';
import { OutletInventoryDetailsComponent } from './components/outlet-inventory-details/outlet-inventory-details.component';
import { InventoryProductDetailsComponent } from './components/inventory-product-details/inventory-product-details.component';
import { WarehouseInventoryDetailsComponent } from './components/warehouse-inventory-details/warehouse-inventory-details.component';
import { MaterialModule } from '../material/material.module';
import { BarecodeScannerLivestreamModule } from 'ngx-barcode-scanner';
import { WebcamModule } from 'ngx-webcam';
import { BarcodeReaderComponent } from './components/barcode-reader/barcode-reader.component';
import { ProductFinderComponent } from './components/product-finder/product-finder.component';
import { InventoryLocationListDetailsComponent } from './components/inventory-location-list-details/inventory-location-list-details.component';
import { StaticInventoryLocationListComponent } from './components/static-inventory-location-list/static-inventory-location-list.component';



@NgModule({
  declarations: [
    JobOrderTypeValuePipe,
    JobOrderStatusValuePipe,
    OutletInventoryDetailsComponent,
    WarehouseInventoryDetailsComponent,
    InventoryProductDetailsComponent,
    BarcodeReaderComponent,
    ProductFinderComponent,
    InventoryLocationListDetailsComponent,
    StaticInventoryLocationListComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NgxAuthFirebaseUIModule.forRoot({
      apiKey: 'AIzaSyAflsLMrOEW9v7y7Y_6UgXDSI14-HVNk58',
      authDomain: 'quickstock-5bc62.firebaseapp.com',
      databaseURL: 'https://quickstock-5bc62.firebaseio.com',
      projectId: 'quickstock-5bc62',
      storageBucket: 'quickstock-5bc62.appspot.com',
      messagingSenderId: '1029697272176',
      appId: '1:1029697272176:web:90bf1532010c9f3e9737b5',
      measurementId: 'G-K57QQC197E'
    }),
    NgxSpinnerModule,
    BarecodeScannerLivestreamModule,
    WebcamModule
  ],
  exports: [
    NgxAuthFirebaseUIModule,
    NgxSpinnerModule,
    JobOrderTypeValuePipe,
    JobOrderStatusValuePipe,
    OutletInventoryDetailsComponent,
    WarehouseInventoryDetailsComponent,
    InventoryProductDetailsComponent,
    BarecodeScannerLivestreamModule,
    WebcamModule,
    BarcodeReaderComponent,
    ProductFinderComponent,
    InventoryLocationListDetailsComponent,
    StaticInventoryLocationListComponent
  ]
})
export class SharedModule { }
