import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveMovedDialogComponent } from './receive-moved-dialog.component';

describe('ReceiveDialogComponent', () => {
  let component: ReceiveMovedDialogComponent;
  let fixture: ComponentFixture<ReceiveMovedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveMovedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveMovedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
