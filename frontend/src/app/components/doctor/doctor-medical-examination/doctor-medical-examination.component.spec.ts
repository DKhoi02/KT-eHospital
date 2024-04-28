import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMedicalExaminationComponent } from './doctor-medical-examination.component';

describe('DoctorMedicalExaminationComponent', () => {
  let component: DoctorMedicalExaminationComponent;
  let fixture: ComponentFixture<DoctorMedicalExaminationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorMedicalExaminationComponent]
    });
    fixture = TestBed.createComponent(DoctorMedicalExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
