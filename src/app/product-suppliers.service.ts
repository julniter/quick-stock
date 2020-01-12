import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductSuppliersService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('product-suppliers');
  }

}
