import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientViewAppointmentComponent } from './patient-view-appointment.component';

describe('PatientViewAppointmentComponent', () => {
  let component: PatientViewAppointmentComponent;
  let fixture: ComponentFixture<PatientViewAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientViewAppointmentComponent]
    });
    fixture = TestBed.createComponent(PatientViewAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
