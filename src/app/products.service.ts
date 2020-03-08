import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('products');
  }

  topFive() {
    return this.afStore.collection('products',
      ref => ref
      .orderBy('createdAt')
      .limit(5)
    );
  }

}
