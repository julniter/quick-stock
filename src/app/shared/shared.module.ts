import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { NgxSpinnerModule } from 'ngx-spinner';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxAuthFirebaseUIModule.forRoot({
      apiKey: 'AIzaSyAflsLMrOEW9v7y7Y_6UgXDSI14-HVNk58',
      authDomain: 'quickstock-5bc62.firebaseapp.com',
      databaseURL: 'https://quickstock-5bc62.firebaseio.com',
      projectId: 'quickstock-5bc62',
      storageBucket: 'quickstock-5bc62.appspot.com',
      messagingSenderId: '1029697272176',
      appId: '1:1029697272176:web:90bf1532010c9f3e9737b5',
      measurementId: 'G-K57QQC197E',
      NgxSpinnerModule
    })
  ],
  exports: [
    NgxAuthFirebaseUIModule,
    NgxSpinnerModule
  ]
})
export class SharedModule { }
