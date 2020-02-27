import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLookUpComponent } from './product-look-up.component';

describe('ProductLookUpComponent', () => {
  let component: ProductLookUpComponent;
  let fixture: ComponentFixture<ProductLookUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductLookUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductLookUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
