import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoriesService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('product-categories');
  }

}
