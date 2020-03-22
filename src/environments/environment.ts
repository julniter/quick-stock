// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyAflsLMrOEW9v7y7Y_6UgXDSI14-HVNk58',
    authDomain: 'quickstock-5bc62.firebaseapp.com',
    databaseURL: 'https://quickstock-5bc62.firebaseio.com',
    projectId: 'quickstock-5bc62',
    storageBucket: 'quickstock-5bc62.appspot.com',
    messagingSenderId: '1029697272176',
    appId: '1:1029697272176:web:90bf1532010c9f3e9737b5',
    measurementId: 'G-K57QQC197E'
  },
  rolesToMapping: {
    0: [
      'authorization',
      'dashboard',
      'customers',
      'sales',
      'products',
      'stock-control',
      'reports',
      'setup'
    ],
    1: [
      'authorization',
      'dashboard',
      'customers',
      'sales',
      'products',
      'stock-control',
      'reports',
      'setup'
    ],
    2: [
      'authorization',
      'dashboard',
      'stock-control',
      'reports'
    ],
    3: [
      'authorization',
      'dashboard',
      'stock-control',
      'reports'
    ]
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
