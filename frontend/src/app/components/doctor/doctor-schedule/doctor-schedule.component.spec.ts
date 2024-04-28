import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorScheduleComponent } from './doctor-schedule.component';

describe('DoctorScheduleComponent', () => {
  let component: DoctorScheduleComponent;
  let fixture: ComponentFixture<DoctorScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorScheduleComponent]
    });
    fixture = TestBed.createComponent(DoctorScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
