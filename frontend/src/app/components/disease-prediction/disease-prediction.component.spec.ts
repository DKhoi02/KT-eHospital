import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseasePredictionComponent } from './disease-prediction.component';

describe('DiseasePredictionComponent', () => {
  let component: DiseasePredictionComponent;
  let fixture: ComponentFixture<DiseasePredictionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiseasePredictionComponent]
    });
    fixture = TestBed.createComponent(DiseasePredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
