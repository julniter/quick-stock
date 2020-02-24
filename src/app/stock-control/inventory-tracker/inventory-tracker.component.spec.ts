import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTrackerComponent } from './inventory-tracker.component';

describe('InventoryTrackerComponent', () => {
  let component: InventoryTrackerComponent;
  let fixture: ComponentFixture<InventoryTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
