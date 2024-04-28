import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewAccountComponent } from './add-new-account.component';

describe('AddNewAccountComponent', () => {
  let component: AddNewAccountComponent;
  let fixture: ComponentFixture<AddNewAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewAccountComponent]
    });
    fixture = TestBed.createComponent(AddNewAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
