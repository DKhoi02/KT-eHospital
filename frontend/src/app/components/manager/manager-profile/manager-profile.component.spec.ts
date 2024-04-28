import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerProfileComponent } from './manager-profile.component';

describe('ManagerProfileComponent', () => {
  let component: ManagerProfileComponent;
  let fixture: ComponentFixture<ManagerProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerProfileComponent]
    });
    fixture = TestBed.createComponent(ManagerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
