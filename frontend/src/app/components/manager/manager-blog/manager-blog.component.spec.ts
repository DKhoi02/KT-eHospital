import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerBlogComponent } from './manager-blog.component';

describe('ManagerBlogComponent', () => {
  let component: ManagerBlogComponent;
  let fixture: ComponentFixture<ManagerBlogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerBlogComponent]
    });
    fixture = TestBed.createComponent(ManagerBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
