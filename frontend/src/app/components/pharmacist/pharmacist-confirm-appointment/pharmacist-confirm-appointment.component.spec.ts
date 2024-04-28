import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacistConfirmAppointmentComponent } from './pharmacist-confirm-appointment.component';

describe('PharmacistConfirmAppointmentComponent', () => {
  let component: PharmacistConfirmAppointmentComponent;
  let fixture: ComponentFixture<PharmacistConfirmAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PharmacistConfirmAppointmentComponent]
    });
    fixture = TestBed.createComponent(PharmacistConfirmAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
