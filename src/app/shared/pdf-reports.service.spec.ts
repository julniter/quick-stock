import { TestBed } from '@angular/core/testing';

import { PdfReportsService } from './pdf-reports.service';

describe('PdfReportsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PdfReportsService = TestBed.get(PdfReportsService);
    expect(service).toBeTruthy();
  });
});
