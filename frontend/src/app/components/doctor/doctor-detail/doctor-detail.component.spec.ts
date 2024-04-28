import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailComponent } from './doctor-detail.component';

describe('DoctorDetailComponent', () => {
  let component: DoctorDetailComponent;
  let fixture: ComponentFixture<DoctorDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorDetailComponent]
    });
    fixture = TestBed.createComponent(DoctorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
