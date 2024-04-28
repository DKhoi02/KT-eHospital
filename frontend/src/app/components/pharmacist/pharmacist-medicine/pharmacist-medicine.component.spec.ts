import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacistMedicineComponent } from './pharmacist-medicine.component';

describe('PharmacistMedicineComponent', () => {
  let component: PharmacistMedicineComponent;
  let fixture: ComponentFixture<PharmacistMedicineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PharmacistMedicineComponent]
    });
    fixture = TestBed.createComponent(PharmacistMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
