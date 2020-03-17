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
import { OutletSalesStatusPipe } from '../outlet-sales-status.pipe';
import { VerifyDialogComponent } from './components/verify-dialog/verify-dialog.component';
import { RejectDialogComponent } from './components/reject-dialog/reject-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CancelDialogComponent } from './components/cancel-dialog/cancel-dialog.component';
import { JobOrderTypePipe } from '../job-order-type.pipe';
import { ProcessDialogComponent } from './process-dialog/process-dialog.component';
import { ReceiveDialogComponent } from './receive-dialog/receive-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DeliverDialogComponent } from './deliver-dialog/deliver-dialog.component';
import { InventorySnapshotStatusPipe } from './inventory-snapshot-status.pipe';
import { MoveInventorySnapshotStatusValuePipe } from './move-inventory-snapshot-status-value.pipe';
import { MoveInventorySnapshotTypePipe } from './move-inventory-snapshot-type.pipe';
import { ReceiveMovedDialogComponent } from './receive-moved-dialog/receive-moved-dialog.component';



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
    StaticInventoryLocationListComponent,
    OutletSalesStatusPipe,
    JobOrderTypePipe,
    VerifyDialogComponent,
    RejectDialogComponent,
    ConfirmDialogComponent,
    CancelDialogComponent,
    ProcessDialogComponent,
    ReceiveDialogComponent,
    DeliverDialogComponent,
    InventorySnapshotStatusPipe,
    MoveInventorySnapshotStatusValuePipe,
    MoveInventorySnapshotTypePipe,
    ReceiveMovedDialogComponent
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
    WebcamModule,
    ReactiveFormsModule
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
    StaticInventoryLocationListComponent,
    OutletSalesStatusPipe,
    VerifyDialogComponent,
    RejectDialogComponent,
    ConfirmDialogComponent,
    CancelDialogComponent,
    JobOrderTypePipe,
    ProcessDialogComponent,
    ReceiveDialogComponent,
    InventorySnapshotStatusPipe,
    MoveInventorySnapshotStatusValuePipe,
    MoveInventorySnapshotTypePipe
  ],
  entryComponents: [
    VerifyDialogComponent,
    RejectDialogComponent,
    ConfirmDialogComponent,
    CancelDialogComponent,
    ProcessDialogComponent,
    ReceiveDialogComponent,
    DeliverDialogComponent,
    ReceiveMovedDialogComponent
  ]
})
export class SharedModule { }
