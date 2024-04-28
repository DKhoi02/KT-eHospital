import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerStatisticComponent } from './manager-statistic.component';

describe('ManagerStatisticComponent', () => {
  let component: ManagerStatisticComponent;
  let fixture: ComponentFixture<ManagerStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerStatisticComponent]
    });
    fixture = TestBed.createComponent(ManagerStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
