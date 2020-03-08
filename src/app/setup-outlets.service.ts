import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class OutletsService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('setup-outlets');
  }

  topFive() {
    return this.afStore.collection('setup-outlets',
      ref => ref
      .orderBy('createdAt')
      .limit(5)
    );
  }

}
