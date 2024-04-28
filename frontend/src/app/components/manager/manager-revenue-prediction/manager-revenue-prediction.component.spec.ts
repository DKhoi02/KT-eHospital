import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerRevenuePredictionComponent } from './manager-revenue-prediction.component';

describe('ManagerRevenuePredictionComponent', () => {
  let component: ManagerRevenuePredictionComponent;
  let fixture: ComponentFixture<ManagerRevenuePredictionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerRevenuePredictionComponent]
    });
    fixture = TestBed.createComponent(ManagerRevenuePredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
