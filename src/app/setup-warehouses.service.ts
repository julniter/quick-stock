import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('setup-warehouses');
  }

}
