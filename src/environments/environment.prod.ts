export const environment = {
  production: true,
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
    '0': [
      'authorization',
      'dashboard',
      'customers',
      'sales',
      'products',
      'stock-control',
      'reports',
      'setup'
    ],
    '1': [
      'authorization',
      'dashboard',
      'customers',
      'sales',
      'products',
      'stock-control',
      'reports',
      'setup'
    ],
    '3': [
      'authorization',
      'dashboard',
      'stock-control',
      'reports'
    ],
    '4': [
      'authorization',
      'dashboard',
      'stock-control',
      'reports'
    ]
  }
};
