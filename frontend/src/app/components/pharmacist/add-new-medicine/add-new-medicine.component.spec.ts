import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewMedicineComponent } from './add-new-medicine.component';

describe('AddNewMedicineComponent', () => {
  let component: AddNewMedicineComponent;
  let fixture: ComponentFixture<AddNewMedicineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewMedicineComponent]
    });
    fixture = TestBed.createComponent(AddNewMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
