import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('customers');
  }

}
