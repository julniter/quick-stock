import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Validators, FormBuilder, FormArray } from '@angular/forms';
import { ProductInventoryItem, InventoryProductVariations, WarehouseInventorySnapshot, MoveInventorySnapshot, MoveInventorySnapshotType, OutletInventorySnapshot } from 'src/app/inventory.model';
import { SpinnerService } from '../spinner.service';
import { InventoryService } from 'src/app/inventory.service';
import { ProductListItem } from 'src/app/products/product-list/product-list-datasource';
import * as firebase from 'firebase';

@Component({
  selector: 'app-receive-moved-dialog',
  templateUrl: './receive-moved-dialog.component.html',
  styleUrls: ['./receive-moved-dialog.component.css']
})
export class ReceiveMovedDialogComponent implements OnInit {

  sourceSnapshot: OutletInventorySnapshot | WarehouseInventorySnapshot;
  destinationSnapshot: OutletInventorySnapshot | WarehouseInventorySnapshot;
  moveInventoryForm = this.fb.group({
    products: this.fb.array([])
  });

  constructor(
    public dialogRef: MatDialogRef<ReceiveMovedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {moveInventorySnapshot: MoveInventorySnapshot},
    private fb: FormBuilder,
    private spinner: SpinnerService,
    private $dbInventory: InventoryService
  ) {}

  get products() {
    return this.moveInventoryForm.get('products') as FormArray;
  }

  getSourceDestination() {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToWarehouse:
        return this.data.moveInventorySnapshot.source['outlet'].name + ' & ' + this.data.moveInventorySnapshot.destination['warehouse'].name;
      case MoveInventorySnapshotType.OutletToOutlet:
        return this.data.moveInventorySnapshot.source['outlet'].name + ' & ' + this.data.moveInventorySnapshot.destination['outlet'].name;
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return this.data.moveInventorySnapshot.source['warehouse'].name + ' & ' + this.data.moveInventorySnapshot.destination['outlet'].name;
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return this.data.moveInventorySnapshot.source['warehouse'].name + ' & ' + this.data.moveInventorySnapshot.destination['warehouse'].name;
    }
  }

  getProductVariations(i) {
    return this.products.controls[i].get('productVariations') as FormArray;
  }

  getProductName(index: number) {
    if (this.data.moveInventorySnapshot.selectedProducts[index]) {
      return this.data.moveInventorySnapshot.selectedProducts[index]
        .product.name;
    }

    return '';
  }

  getProductVariationCount(index: number) {
    if (this.data.moveInventorySnapshot.selectedProducts[index]) {
      return this.data.moveInventorySnapshot.selectedProducts[index]
        .product.variations.length;
    }

    return '';
  }

  ngOnInit(): void {
    this.data.moveInventorySnapshot.productVariations.map((pi: ProductInventoryItem) => {
      this.products.push(
        this.fb.group({
          productVariations: this.fb.array(
            this.createProductVariationFormArray(pi.productVariations)
          )
        })
      );
    });
  }

  createProductVariationFormArray(variations: InventoryProductVariations[]) {
    return (variations as any).map((v: InventoryProductVariations) => {
      return this.fb.group({
        name: [{ value: v.name, disabled: true }, Validators.required],
        code: [{ value: v.code, disabled: true }, Validators.required],
        count: [(v.count === undefined ? null : v.count), Validators.required]
      });
    });
  }

  private getSource() {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.OutletToWarehouse:
        return this.$dbInventory.getLatestOutletSnapshot(this.data.moveInventorySnapshot.source['outlet'].id);
      case MoveInventorySnapshotType.WarehouseToOutlet:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return this.$dbInventory.getLatestWarehouseSnapshot(this.data.moveInventorySnapshot.source['warehouse'].id);
    }
  }

  private getDestination() {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return this.$dbInventory.getLatestOutletSnapshot(this.data.moveInventorySnapshot.source['outlet'].id);
      case MoveInventorySnapshotType.OutletToWarehouse:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return this.$dbInventory.getLatestWarehouseSnapshot(this.data.moveInventorySnapshot.source['warehouse'].id);
    }
  }

  private getSourceRef() {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.OutletToWarehouse:
        return this.$dbInventory.outlet;
      case MoveInventorySnapshotType.WarehouseToOutlet:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return this.$dbInventory.warehouse;
    }
  }

  private getDestinationRef() {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.WarehouseToOutlet:
        return this.$dbInventory.outlet;
      case MoveInventorySnapshotType.OutletToWarehouse:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return this.$dbInventory.warehouse;
    }
  }


  private saveSource(snapshot: OutletInventorySnapshot | WarehouseInventorySnapshot) {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToOutlet:
      case MoveInventorySnapshotType.OutletToWarehouse:
        return this.$dbInventory.saveOutlet(snapshot as OutletInventorySnapshot);
      case MoveInventorySnapshotType.WarehouseToOutlet:
      case MoveInventorySnapshotType.WarehouseToWarehouse:
      default:
        return this.$dbInventory.saveWarehouse(snapshot as WarehouseInventorySnapshot);
    }
  }

  private saveDestination(snapshot: OutletInventorySnapshot | WarehouseInventorySnapshot) {
    switch (this.data.moveInventorySnapshot.type) {
      case MoveInventorySnapshotType.OutletToOutlet:
        case MoveInventorySnapshotType.WarehouseToOutlet:
        return this.$dbInventory.saveOutlet(snapshot as OutletInventorySnapshot);
      case MoveInventorySnapshotType.WarehouseToWarehouse:
        case MoveInventorySnapshotType.OutletToWarehouse:
      default:
        return this.$dbInventory.saveWarehouse(snapshot as WarehouseInventorySnapshot);
    }
  }

  onSubmit() {
    const errorFn = error => {
      console.error(error);
    };

    const finallyFn = () => {
      this.spinner.hide();
      this.dialogRef.close(true);
    };

    if (this.moveInventoryForm.valid) {

      this.spinner.show();

      const inventoryForm = this.moveInventoryForm.getRawValue();

      Promise.all([
        this.getSource(),
        this.getDestination()
      ]);

      this.sourceSnapshot.snapshot
      = this.$dbInventory.updateSnapshotLessProduct(
        this.sourceSnapshot.snapshot,
        inventoryForm.products, this.data.moveInventorySnapshot.selectedProducts
        );

      this.sourceSnapshot.productIds
      = this.sourceSnapshot.snapshot.productInventory.map(p => p.id);

      this.destinationSnapshot.snapshot
      = this.$dbInventory.updateSnapshotAddProduct(
        this.destinationSnapshot.snapshot,
        inventoryForm.products, this.data.moveInventorySnapshot.selectedProducts
        );

      this.destinationSnapshot.productIds
      = this.destinationSnapshot.snapshot.productInventory.map(p => p.id);

      const sourceRef = this.getSourceRef();
      const destinationRef = this.getDestinationRef();
      const timeStamp = firebase.firestore.FieldValue.serverTimestamp();

      this.sourceSnapshot.id = sourceRef.ref.doc().id;
      this.sourceSnapshot.createdAt = timeStamp;
      this.destinationSnapshot.id = destinationRef.ref.doc().id;
      this.destinationSnapshot.createdAt = timeStamp;

      Promise.all([
        this.saveSource(this.sourceSnapshot),
        this.saveDestination(this.destinationSnapshot)
      ])
      .catch(errorFn)
      .finally(finallyFn);

    }
  }

}
