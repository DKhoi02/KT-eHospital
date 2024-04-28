import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacistAddConfirmAppointmentComponent } from './pharmacist-add-confirm-appointment.component';

describe('PharmacistAddConfirmAppointmentComponent', () => {
  let component: PharmacistAddConfirmAppointmentComponent;
  let fixture: ComponentFixture<PharmacistAddConfirmAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PharmacistAddConfirmAppointmentComponent]
    });
    fixture = TestBed.createComponent(PharmacistAddConfirmAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
