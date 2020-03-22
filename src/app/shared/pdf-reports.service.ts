import { Injectable } from '@angular/core';
import { OutletInventorySnapshot, ProductInventoryItem, InventoryProductVariations, WarehouseInventorySnapshot, LocationInventorySnapshot } from '../inventory.model';
import { ProductListItem } from '../products/product-list/product-list-datasource';
import { DatePipe } from '@angular/common';

export const STYLES = {
  header: { bold: true, fontSize: 14, margin: [0, 0, 0, 5], color: '#3f51b5' },
  subHeader: { bold: false, fontSize: 8, margin: [0, 0, 0, 10], color: '#333' },
  subHeaderGray: { bold: false, fontSize: 8, margin: [0, 0, 0, 10], color: '#555' },
  header2: { bold: true, fontSize: 10, margin: [0, 0, 0, 5], color: '#333' },
  header2DoubleSpace: { bold: true, fontSize: 10, margin: [0, 0, 0, 20], color: '#ff4081' },
  header3: { bold: true, fontSize: 8, margin: [0, 0, 0, 5], color: '#333' },
  normal: { bold: false, fontSize: 8, margin: [0, 0, 0, 5], color: '#333' },
  normalGray: { bold: false, fontSize: 8, margin: [0, 0, 0, 5], color: '#555' },
  textCenter: { alignment: 'center', color: '#333' },
  textCenterBold: { alignment: 'center', bold: true, color: '#333' },
  textRight: { alignment: 'right', color: '#333' },
  textRightBold: { alignment: 'right', bold: true, color: '#333' },
  smMarginBottom: { margin: [0, 0, 0, 5] },
  mdMarginBottom: { margin: [0, 0, 0, 10] },
  lgMarginBottom: { margin: [0, 0, 0, 15] },
  xlMarginBottom: { margin: [0, 0, 0, 20] },
  xxlMarginBottom: { margin: [0, 0, 0, 40] },
  descriptionTable: { fontSize: 8, margin: [0, 0, 0, 15] },
  breakdownTable: { fontSize: 5 },
  totalTable: { fontSize: 5, margin: [0, 0, 0, 40] }
};

export interface DataRangedSummaryReport {
  dateRange: SummaryReportDateRange;
  startSnapshot: OutletInventorySnapshot | WarehouseInventorySnapshot;
  endSnapshot: OutletInventorySnapshot | WarehouseInventorySnapshot;
}

export interface ProductSummaryDataReport {
  product: ProductListItem;
  outletSnapshots: DataRangedSummaryReport[];
  warehouseSnapshots: DataRangedSummaryReport[];
}

export interface SummaryReportDateRange {
  fromDate: Date;
  toDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PdfReportsService {

  constructor() { }

  getOutletSummaryDocDef(outletSnapshots: DataRangedSummaryReport[]) {
    const twoDimentionContent = outletSnapshots.map((snapshot: DataRangedSummaryReport, index) => {
      return [].concat(...this.outletDetailsLayout(snapshot, index), ...this.productDetailsLayout(snapshot));
    });

    return this.docDefWrapper(twoDimentionContent, 'landscape');
  }

  getWarehouseSummaryDocDef(warehouseSnapshots: DataRangedSummaryReport[]) {
    const twoDimentionContent = warehouseSnapshots.map((snapshot: DataRangedSummaryReport, index) => {
      return [].concat(...this.warehouseDetailsLayout(snapshot, index), ...this.productDetailsLayout(snapshot));
    });

    return this.docDefWrapper(twoDimentionContent, 'landscape');
  }

  getProductSummaryDocDef(productSummaryDataReport: ProductSummaryDataReport[], dataRange: SummaryReportDateRange) {
    const twoDimentionContent = productSummaryDataReport.map((psd: ProductSummaryDataReport, index) => {
      return [].concat(...this.productDescriptionLayout(psd, index), this.inventoryLocationDetailsLayout(psd, dataRange));
    });

    return this.docDefWrapper(twoDimentionContent, 'landscape');
  }

  private docDefWrapper(contents, pageOrientation = 'portrait') {
    const flatContent = [...contents];
    return {
      styles: STYLES,
      content: [...flatContent],
      pageOrientation,
      pageMargins: [15, 15, 15, 15]
    };
  }

  private outletDetailsLayout(outletRangedSnapshot: DataRangedSummaryReport, index: number) {
    const outlet = outletRangedSnapshot.endSnapshot as OutletInventorySnapshot;
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
        text: 'From ' + new DatePipe('en-US').transform(outletRangedSnapshot.dateRange.fromDate, 'longDate') + ' to ' + new DatePipe('en-US').transform(outletRangedSnapshot.dateRange.toDate, 'longDate'),
        style: 'header3'
      },
      {
        text: ('Total Product Type: ' + outlet.snapshot.productInventory.length),
        style: 'header2DoubleSpace'
      }
    ];
  }

  private warehouseDetailsLayout(warehouseRangedSnapshot: DataRangedSummaryReport, index: number) {
    const warehouse = warehouseRangedSnapshot.endSnapshot as WarehouseInventorySnapshot;
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
    const getTotalProducts = (snapshot: DataRangedSummaryReport[]) => {
      if (snapshot.length) { return 0; }

      const total = 0 ;

      snapshot.map(dr => {
        if (dr.endSnapshot) {
          if (dr.endSnapshot.snapshot.productInventory.length) {
            dr.endSnapshot.snapshot.productInventory[0].productVariations.map(v => v.count).reduce((a, b) => +a + +b, total)
          }
        }
      });

      return total;
    };

    const warehouseTotal = getTotalProducts(psd.warehouseSnapshots);
    const outletTotal = getTotalProducts(psd.outletSnapshots);
    const grandTotal = warehouseTotal + outletTotal;

    return [
      getProductName(),
      {text: psd.product.product.description, style: 'normalGray'},
      {
        style: 'descriptionTable',
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
            , { text: outletTotal, style: 'textCenter'}
            , { text: warehouseTotal, style: 'textCenter'}
            , { text: grandTotal, style: 'textCenter'}
            ]
          ]
        },
        layout: 'noBorders'
      }
    ];
  }

  private productDetailsLayout(snapshot: DataRangedSummaryReport) {
    const getVariantText = (pi: ProductInventoryItem) => {
      return pi.product.variants.map(v => v.variant).join(', ');
    };
    const getVariantValueText = (pi: ProductInventoryItem) => {
      return pi.product.variants.map(v => v.variantValues).join(' / ');
    };
    const getTotalProducts = (outletSnapshot: LocationInventorySnapshot, index: number) => {
      if (outletSnapshot === undefined) { return 0; }
      const pi = outletSnapshot.snapshot.productInventory[index];
      if (pi === undefined) { return 0; }
      return +pi.productVariations.map(v => v.count).reduce((a, b) => +a + +b, 0);
    };
    const startCount = (pi: ProductInventoryItem, index: number) => {
      if (snapshot.startSnapshot === undefined ) {  return 0; }
      const outletSnapshot = snapshot.startSnapshot as LocationInventorySnapshot;
      const startPi = outletSnapshot.snapshot.productInventory.find(p => p.id === pi.id);
      if (startPi === undefined) { return 0; }
      return startPi.productVariations[index].count;
    };
    const getVariations = (pi: ProductInventoryItem) => {
      const variations = pi.productVariations.map((pv: InventoryProductVariations, index: number) => {
        return [
          { text: pv.name}
        , { text: pv.sku, style: 'textCenter'}
        , { text: pv.code, style: 'textCenter'}
        , { text: pv.price, style: 'textRight'}
        , { text: startCount(pi, index), style: 'textRight'}
        , { text: pv.count, style: 'textRight'}
        ];
      });

      variations.unshift([
        { text: 'Variant Name', style: 'textCenterBold'}
      , { text: 'SKU', style: 'textCenterBold'}
      , { text: 'Code', style: 'textCenterBold'}
      , { text: 'Price', style: 'textCenterBold'}
      , { text: 'Start Count (' + new DatePipe('en-US').transform(snapshot.dateRange.fromDate, 'longDate') + ')', style: 'textCenterBold'}
      , { text: 'End Count (' + new DatePipe('en-US').transform(snapshot.dateRange.toDate, 'longDate') + ')', style: 'textCenterBold'}
      ]);

      return variations;
    };

    return snapshot.endSnapshot['snapshot'].productInventory.map((pi: ProductInventoryItem, index: number) => {
      return [
        {text: ('Product Name: ' + pi.product.name), style: 'header3'},
        {text: pi.product.description, style: 'normalGray'},
        {
          style: 'descriptionTable',
          table: {
            widths: [150, '*', '*', '*', '*', '*'],
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
          style: 'breakdownTable',
          table: {
            widths: [150, '*', '*', '*', '*', '*'],
            headerRows: 1,
            body: getVariations(pi),
            layout: 'lightHorizontalLines'
          }
        },
        {
          style: 'totalTable',
          table: {
            widths: [150, '*', '*', '*', '*', '*'],
            body: [
              ['', '', '',
                { text: 'Total', style: 'textRightBold' },
                { text: getTotalProducts((snapshot.startSnapshot as LocationInventorySnapshot), index) , style: 'textRightBold' },
                { text: getTotalProducts((snapshot.endSnapshot as LocationInventorySnapshot), index) , style: 'textRightBold' }
              ]
            ]
          },
          layout: 'noBorders'
        }
      ];
    });
  }

  private inventoryLocationDetailsLayout(psd: ProductSummaryDataReport, dateRange: SummaryReportDateRange) {
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

    const getVariations = (start: LocationInventorySnapshot, end: LocationInventorySnapshot) => {
      const variantCount = end.snapshot.productInventory.map((pi: ProductInventoryItem, index: number) => {

        const totalStart = start !== undefined ? +start.snapshot.productInventory[index].productVariations.map(pv => pv.count).reduce((a, b) => +a + +b, 0) : 0;
        const totalEnd = +pi.productVariations.map(pv => pv.count).reduce((a, b) => +a + +b, 0);

        let startVariations = start !== undefined ? start.snapshot.productInventory[index].productVariations.map(pv => ({ text: pv.count, style: 'textRight' })) : [];
            startVariations = startVariations.length ? startVariations : pi.productVariations.map(pv => ({ text: 0, style: 'textRight' }))
        const endVariations = pi.productVariations.map(pv => ({ text: pv.count, style: 'textRight' }));

        return [{text: pi.reOrderPoint, style: 'textRight'}]
        .concat(
          startVariations,
          [{text: totalStart, style: 'textRightBold'}], // start total
          endVariations, // end
          [{text: totalEnd, style: 'textRightBold'}] // end total
        );

      });

      const name = (getLocationName(end) + ' ' + getOutletAddress(end as OutletInventorySnapshot) + getWarehouseAddress(end as WarehouseInventorySnapshot));

      return [
        { text: name },
        { text: getLocationType(end) },
        ...variantCount[0]
      ];
    };

    const outletRecords = psd.outletSnapshots.map((os: DataRangedSummaryReport) => {
      const start = os.startSnapshot !== undefined ? os.startSnapshot as OutletInventorySnapshot : undefined;
      const end = os.endSnapshot !== undefined ? os.endSnapshot as OutletInventorySnapshot : undefined;
      return getVariations(start, end);
    });

    const warehouseRecords = psd.warehouseSnapshots.map((ws: DataRangedSummaryReport) => {
      const start = ws.startSnapshot !== undefined ? ws.startSnapshot as WarehouseInventorySnapshot : undefined;
      const end = ws.endSnapshot !== undefined ? ws.endSnapshot as WarehouseInventorySnapshot : undefined;
      return getVariations(start, end);
    });

    const width = [].concat(psd.product.product.variations.map(v => '*'), psd.product.product.variations.map(v => '*'));
    const size = (600 / ((psd.product.product.variations.length * 2) + 2 ));
    const header = [
      {text: 'Inventory Location', style: 'textCenterBold', colSpan:  3 }, {text: ''}, {text: ''},
      {text: new DatePipe('en-US').transform(dateRange.fromDate, 'longDate') , style: 'textCenterBold', colSpan: (psd.product.product.variations.length + 1) }, // start
      ...psd.product.product.variations.map(v => {
        return {text: ''};
      }), // start
      {text: new DatePipe('en-US').transform(dateRange.toDate, 'longDate'), style: 'textCenterBold', colSpan: (psd.product.product.variations.length + 1) }, // end
      ...psd.product.product.variations.map(v => {
        return {text: ''};
      }) // end
    ];
    const subheader = [
      {text: 'Location', style: 'textCenterBold'},
      {text: 'Type', style: 'textCenterBold'},
      {text: 'Reorder Point', style: 'textCenterBold'},

    ].concat(
      psd.product.product.variations.map(v => {
        return {text: v.name, style: 'textCenterBold'};
      }), // start
      [{text: 'Total', style: 'textCenterBold'}], // end
      psd.product.product.variations.map(v => {
        return {text: v.name, style: 'textCenterBold'};
      }), // end
      [{text: 'Total', style: 'textCenterBold'}]// end
    );

    const bodyContent = [
      header,
      subheader,
      ...outletRecords,
      ...warehouseRecords
    ];

    return {
      style: 'descriptionTable',
      table: {
        widths: [size, '*', '*', '*', '*'].concat(width as any),
        headerRows: 2,
        body: bodyContent,
        layout: 'lightHorizontalLines'
      }
    };

  }

}
