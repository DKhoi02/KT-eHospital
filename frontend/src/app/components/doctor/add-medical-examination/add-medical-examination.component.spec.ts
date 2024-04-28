import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedicalExaminationComponent } from './add-medical-examination.component';

describe('AddMedicalExaminationComponent', () => {
  let component: AddMedicalExaminationComponent;
  let fixture: ComponentFixture<AddMedicalExaminationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMedicalExaminationComponent]
    });
    fixture = TestBed.createComponent(AddMedicalExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
