import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChangeAppointmentComponent } from './manage-change-appointment.component';

describe('ManageChangeAppointmentComponent', () => {
  let component: ManageChangeAppointmentComponent;
  let fixture: ComponentFixture<ManageChangeAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageChangeAppointmentComponent]
    });
    fixture = TestBed.createComponent(ManageChangeAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
