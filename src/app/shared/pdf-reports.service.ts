import { Injectable } from '@angular/core';
import { OutletInventorySnapshot, ProductInventoryItem, InventoryProductVariations, WarehouseInventorySnapshot, LocationInventorySnapshot } from '../inventory.model';
import { ProductListItem } from '../products/product-list/product-list-datasource';

export const STYLES = {
  header: { bold: true, fontSize: 18, margin: [0, 0, 0, 5], color: '#3f51b5' },
  subHeader: { bold: false, fontSize: 12, margin: [0, 0, 0, 10], color: '#333' },
  subHeaderGray: { bold: false, fontSize: 12, margin: [0, 0, 0, 10], color: '#555' },
  header2: { bold: true, fontSize: 14, margin: [0, 0, 0, 5], color: '#333' },
  header2DoubleSpace: { bold: true, fontSize: 14, margin: [0, 0, 0, 40], color: '#ff4081' },
  header3: { bold: true, fontSize: 12, margin: [0, 0, 0, 5], color: '#333' },
  normal: { bold: false, fontSize: 12, margin: [0, 0, 0, 5], color: '#333' },
  normalGray: { bold: false, fontSize: 12, margin: [0, 0, 0, 5], color: '#555' },
  textCenter: { alignment: 'center', color: '#333' },
  textCenterBold: { alignment: 'center', bold: true, color: '#333' },
  textRight: { alignment: 'right', color: '#333' },
  textRightBold: { alignment: 'right', bold: true, color: '#333' },
  smMarginBottom: { margin: [0, 0, 0, 5] },
  mdMarginBottom: { margin: [0, 0, 0, 10] },
  lgMarginBottom: { margin: [0, 0, 0, 15] },
  xlMarginBottom: { margin: [0, 0, 0, 20] },
  xxlMarginBottom: { margin: [0, 0, 0, 40] }
};

export interface ProductSummaryDataReport {
  product: ProductListItem;
  outletSnapshots: OutletInventorySnapshot[];
  warehouseSnapshots: WarehouseInventorySnapshot[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfReportsService {

  constructor() { }

  getOutletSummaryDocDef(outletSnapshots: OutletInventorySnapshot[]) {
    const twoDimentionContent = outletSnapshots.map((snapshot: OutletInventorySnapshot, index) => {
      return [].concat(...this.outletDetailsLayout(snapshot, index), ...this.productDetailsLayout(snapshot));
    });

    return this.docDefWrapper(twoDimentionContent);
  }

  getWarehouseSummaryDocDef(warehouseSnapshots: WarehouseInventorySnapshot[]) {
    const twoDimentionContent = warehouseSnapshots.map((snapshot: WarehouseInventorySnapshot, index) => {
      return [].concat(...this.warehouseDetailsLayout(snapshot, index), ...this.productDetailsLayout(snapshot));
    });

    return this.docDefWrapper(twoDimentionContent);
  }

  getProductSummaryDocDef(productSummaryDataReport: ProductSummaryDataReport[]) {
    const twoDimentionContent = productSummaryDataReport.map((psd: ProductSummaryDataReport, index) => {
      return [].concat(...this.productDescriptionLayout(psd, index), this.inventoryLocationDetailsLayout(psd));
    });

    return this.docDefWrapper(twoDimentionContent, 'landscape');
  }

  private docDefWrapper(contents, pageOrientation = 'portrait') {
    const flatContent = [...contents];
    return {
      styles: STYLES,
      content: [...flatContent],
      pageOrientation
    };
  }

  private outletDetailsLayout(outlet: OutletInventorySnapshot, index: number) {
    const getOutletName = () => {
      if (index !== 0) {
        return {text: outlet.outlet.outlet.name, style: 'header', pageBreak: 'before'};
      }

      return {text: outlet.outlet.outlet.name, style: 'header'};
    };
    const getAddress = () => {
      return (outlet.outlet.outlet.address.trim().length ? (outlet.outlet.outlet.address + ', ') : '') +
        (outlet.outlet.outlet.address2.trim().length ? (outlet.outlet.outlet.address2 + ', ') : '') +
        (outlet.outlet.outlet.city.trim().length ? (outlet.outlet.outlet.city + ', ') : '') +
        (outlet.outlet.outlet.province.trim().length ? (outlet.outlet.outlet.province + ', ') : '') +
        (outlet.outlet.outlet.postalCode ? (outlet.outlet.outlet.postalCode) : '');
    };

    return [
      getOutletName(),
      {
        text: getAddress(),
        style: 'subHeaderGray'
      },
      {
        text: ('Total Product Type: ' + outlet.snapshot.productInventory.length),
        style: 'header2DoubleSpace'
      }
    ];
  }

  private warehouseDetailsLayout(warehouse: WarehouseInventorySnapshot, index: number) {
    const getOutletName = () => {
      if (index !== 0) {
        return {text: warehouse.warehouse.warehouse.name, style: 'header', pageBreak: 'before'};
      }

      return {text: warehouse.warehouse.warehouse.name, style: 'header'};
    };
    const getAddress = () => {
      return (warehouse.warehouse.warehouse.address.trim().length ? (warehouse.warehouse.warehouse.address + ', ') : '') +
        (warehouse.warehouse.warehouse.address2.trim().length ? (warehouse.warehouse.warehouse.address2 + ', ') : '') +
        (warehouse.warehouse.warehouse.city.trim().length ? (warehouse.warehouse.warehouse.city + ', ') : '') +
        (warehouse.warehouse.warehouse.province.trim().length ? (warehouse.warehouse.warehouse.province + ', ') : '') +
        (warehouse.warehouse.warehouse.postalCode ? (warehouse.warehouse.warehouse.postalCode) : '');
    };

    return [
      getOutletName(),
      {
        text: getAddress(),
        style: 'subHeaderGray'
      },
      {
        text: ('Total Product Type: ' + warehouse.snapshot.productInventory.length),
        style: 'header2DoubleSpace'
      }
    ];
  }

  private productDescriptionLayout(
    psd: ProductSummaryDataReport,
    index: number
  ) {
    const getProductName = () => {
      if (index !== 0) {
        return {text: psd.product.product.name, style: 'header', pageBreak: 'before'};
      }

      return {text: psd.product.product.name, style: 'header'};
    };
    const getVariantText = (pi: ProductListItem) => {
      return pi.product.variants.map(v => v.variant).join(', ');
    };
    const getVariantValueText = (pi: ProductListItem) => {
      return pi.product.variants.map(v => v.variantValues).join(' / ');
    };

    return [
      getProductName(),
      {text: psd.product.product.description, style: 'normalGray'},
      {
        style: 'lgMarginBottom',
        table: {
          widths: [120, '*', '*', '*', '*', '*', '*', '*'],
          headerRows: 1,
          body: [
            [
              { text: 'Brand', style: 'textCenterBold'}
            , { text: 'Category', style: 'textCenterBold'}
            , { text: 'Type', style: 'textCenterBold'}
            , { text: 'Variations', style: 'textCenterBold'}
            , { text: 'Variations', style: 'textCenterBold'}
            , { text: 'Outlet Total', style: 'textCenterBold'}
            , { text: 'Warehouse Total', style: 'textCenterBold'}
            , { text: 'Grand Total', style: 'textCenterBold'}
            ],
            [
              { text: psd.product.product.brand, style: 'textCenter'}
            , { text: psd.product.product.category, style: 'textCenter'}
            , { text: psd.product.product.type, style: 'textCenter'}
            , { text: getVariantText(psd.product), style: 'textCenter'}
            , { text: getVariantValueText(psd.product), style: 'textCenter'}
            , { text: '4200', style: 'textCenter'}
            , { text: '23400', style: 'textCenter'}
            , { text: '27600', style: 'textCenter'}
            ]
          ]
        },
        layout: 'noBorders'
      }
    ];
  }

  private productDetailsLayout(location: OutletInventorySnapshot | WarehouseInventorySnapshot) {
    const getVariantText = (pi: ProductInventoryItem) => {
      return pi.product.variants.map(v => v.variant).join(', ');
    };
    const getVariantValueText = (pi: ProductInventoryItem) => {
      return pi.product.variants.map(v => v.variantValues).join(' / ');
    };
    const getTotalProducts = (pi: ProductInventoryItem) => {
      return +pi.productVariations.map(v => v.count).reduce((a, b) => +a + +b, 0);
    };
    const getVariations = (pi: ProductInventoryItem) => {
      const variations = pi.productVariations.map((pv: InventoryProductVariations) => {
        return [
          { text: pv.name}
        , { text: pv.sku, style: 'textCenter'}
        , { text: pv.code, style: 'textCenter'}
        , { text: pv.price, style: 'textRight'}
        , { text: pv.count, style: 'textRight'}
        ];
      });

      variations.unshift([
        { text: 'Variant Name', style: 'textCenterBold'}
      , { text: 'SKU', style: 'textCenterBold'}
      , { text: 'Code', style: 'textCenterBold'}
      , { text: 'Price', style: 'textCenterBold'}
      , { text: 'Count', style: 'textCenterBold'}
      ]);

      return variations;
    };

    return location.snapshot.productInventory.map((pi: ProductInventoryItem) => {
      return [
        {text: ('Product Name: ' + pi.product.name), style: 'header3'},
        {text: pi.product.description, style: 'normalGray'},
        {
          style: 'lgMarginBottom',
          table: {
            widths: [100, '*', '*', '*', '*', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'Brand', style: 'textCenterBold'}
              , { text: 'Category', style: 'textCenterBold'}
              , { text: 'Type', style: 'textCenterBold'}
              , { text: 'Variations', style: 'textCenterBold'}
              , { text: 'Variations', style: 'textCenterBold'}
              , { text: 'Reorder Point', style: 'textCenterBold'}
              ],
              [
                { text: pi.product.brand, style: 'textCenter'}
              , { text: pi.product.category, style: 'textCenter'}
              , { text: pi.product.type, style: 'textCenter'}
              , { text: getVariantText(pi), style: 'textCenter'}
              , { text: getVariantValueText(pi), style: 'textCenter'}
              , { text: pi.reOrderPoint, style: 'textCenter'}
              ]
            ]
          },
          layout: 'noBorders'
        },
        {
          table: {
            widths: [120, '*', '*', '*', '*'],
            headerRows: 1,
            body: getVariations(pi),
            layout: 'lightHorizontalLines'
          }
        },
        {
          style: 'xxlMarginBottom',
          table: {
            widths: [120, '*', '*', '*', '*'],
            body: [
              ['', '', '',
                { text: 'Total', style: 'textRightBold' },
                { text: getTotalProducts(pi) , style: 'textRightBold' }
              ]
            ]
          },
          layout: 'noBorders'
        }
      ];
    });
  }

  private inventoryLocationDetailsLayout(psd: ProductSummaryDataReport) {
    const getOutletAddress = (outlet: OutletInventorySnapshot) => {
      if (outlet.outlet === undefined) { return ''; }

      return (outlet.outlet.outlet.address.trim().length ? (outlet.outlet.outlet.address + ', ') : '') +
        (outlet.outlet.outlet.address2.trim().length ? (outlet.outlet.outlet.address2 + ', ') : '') +
        (outlet.outlet.outlet.city.trim().length ? (outlet.outlet.outlet.city + ', ') : '') +
        (outlet.outlet.outlet.province.trim().length ? (outlet.outlet.outlet.province + ', ') : '') +
        (outlet.outlet.outlet.postalCode ? (outlet.outlet.outlet.postalCode) : '');
    };

    const getWarehouseAddress = (warehouse: WarehouseInventorySnapshot) => {
      if (warehouse.warehouse === undefined) { return ''; }

      return (warehouse.warehouse.warehouse.address.trim().length ? (warehouse.warehouse.warehouse.address + ', ') : '') +
        (warehouse.warehouse.warehouse.address2.trim().length ? (warehouse.warehouse.warehouse.address2 + ', ') : '') +
        (warehouse.warehouse.warehouse.city.trim().length ? (warehouse.warehouse.warehouse.city + ', ') : '') +
        (warehouse.warehouse.warehouse.province.trim().length ? (warehouse.warehouse.warehouse.province + ', ') : '') +
        (warehouse.warehouse.warehouse.postalCode ? (warehouse.warehouse.warehouse.postalCode) : '');
    };

    const getLocationName = (s: LocationInventorySnapshot) => {
      if ((s as OutletInventorySnapshot).outlet) {
        return (s as OutletInventorySnapshot).outlet.outlet.name;
      }

      if ((s as WarehouseInventorySnapshot).warehouse) {
        return (s as WarehouseInventorySnapshot).warehouse.warehouse.name;
      }
    };

    const getLocationType = (s: LocationInventorySnapshot) => {
      if ((s as OutletInventorySnapshot).outlet) {
        return 'Outlet';
      }

      if ((s as WarehouseInventorySnapshot).warehouse) {
        return 'Warehouse';
      }
    };

    const getVariations = (s: LocationInventorySnapshot) => {
      const variantCount = s.snapshot.productInventory.map((pi: ProductInventoryItem) => {
        const total = +pi.productVariations.map(pv => pv.count).reduce((a, b) => +a + +b, 0);
        return [{text: pi.reOrderPoint, style: 'textRight'}]
        .concat(
          pi.productVariations.map(pv => ({ text: pv.count, style: 'textRight' })),
          [{text: total, style: 'textRightBold'}]
        );
      });

      return [
        { text: getLocationName(s) },
        { text: getOutletAddress(s as OutletInventorySnapshot) + getWarehouseAddress(s as WarehouseInventorySnapshot) },
        { text: getLocationType(s) },
        ...variantCount[0]
      ];
    };

    const outletRecords = psd.outletSnapshots.map((os: OutletInventorySnapshot) => {
      return getVariations(os);
    });

    const warehouseRecords = psd.warehouseSnapshots.map((ws: WarehouseInventorySnapshot) => {
      return getVariations(ws);
    });

    const width = psd.product.product.variations.map(v => '*');
    const size = (600 / (psd.product.product.variations.length + 2));
    const header = [
      {text: 'Location', style: 'textCenterBold'},
      {text: 'Address', style: 'textCenterBold'},
      {text: 'Type', style: 'textCenterBold'},
      {text: 'Reorder Point', style: 'textCenterBold'},

    ].concat(psd.product.product.variations.map(v => {
      return {text: v.name, style: 'textCenterBold'};
    })
    , [{text: 'Total', style: 'textCenterBold'}]);

    const bodyContent = [
      header,
      ...outletRecords,
      ...warehouseRecords
    ];

    return {
      table: {
        widths: [size, '*', '*', '*', '*'].concat(width as any),
        headerRows: 1,
        body: bodyContent,
        layout: 'lightHorizontalLines'
      }
    };

  }

}
