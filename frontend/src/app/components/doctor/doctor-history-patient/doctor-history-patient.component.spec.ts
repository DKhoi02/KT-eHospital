import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorHistoryPatientComponent } from './doctor-history-patient.component';

describe('DoctorHistoryPatientComponent', () => {
  let component: DoctorHistoryPatientComponent;
  let fixture: ComponentFixture<DoctorHistoryPatientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorHistoryPatientComponent]
    });
    fixture = TestBed.createComponent(DoctorHistoryPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
