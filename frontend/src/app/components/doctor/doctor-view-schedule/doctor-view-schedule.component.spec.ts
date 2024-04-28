import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorViewScheduleComponent } from './doctor-view-schedule.component';

describe('DoctorViewScheduleComponent', () => {
  let component: DoctorViewScheduleComponent;
  let fixture: ComponentFixture<DoctorViewScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorViewScheduleComponent]
    });
    fixture = TestBed.createComponent(DoctorViewScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
