import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductsToWarehouseService {

  constructor(private afStore: AngularFirestore) {}

  ref() {
    return this.afStore.collection('products-to-warehouse');
    /*
      outlet-product {
        outletid: {
          products: [
            productInventory: {
              product: {
                productVariations: {
                  name: string,
                  count-
                }
              }
            },
            productVariations: {
              name: string as id,
              count: string
            },
            productVariations: {
              name: string as id,
              count: string
            }
          ]
        }
      }
    */
  }

}
