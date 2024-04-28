import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerViewBlogComponent } from './manager-view-blog.component';

describe('ManagerViewBlogComponent', () => {
  let component: ManagerViewBlogComponent;
  let fixture: ComponentFixture<ManagerViewBlogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerViewBlogComponent]
    });
    fixture = TestBed.createComponent(ManagerViewBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
