import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddminProfileComponent } from './addmin-profile.component';

describe('AddminProfileComponent', () => {
  let component: AddminProfileComponent;
  let fixture: ComponentFixture<AddminProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddminProfileComponent]
    });
    fixture = TestBed.createComponent(AddminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
