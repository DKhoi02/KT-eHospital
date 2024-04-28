import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerAppointmentComponent } from './manager-appointment.component';

describe('ManagerAppointmentComponent', () => {
  let component: ManagerAppointmentComponent;
  let fixture: ComponentFixture<ManagerAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerAppointmentComponent]
    });
    fixture = TestBed.createComponent(ManagerAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
