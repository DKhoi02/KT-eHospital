import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateScheduleComponent } from './add-update-schedule.component';

describe('AddUpdateScheduleComponent', () => {
  let component: AddUpdateScheduleComponent;
  let fixture: ComponentFixture<AddUpdateScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddUpdateScheduleComponent]
    });
    fixture = TestBed.createComponent(AddUpdateScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
