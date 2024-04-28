import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSystemComponent } from './admin-system.component';

describe('AdminSystemComponent', () => {
  let component: AdminSystemComponent;
  let fixture: ComponentFixture<AdminSystemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminSystemComponent]
    });
    fixture = TestBed.createComponent(AdminSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
