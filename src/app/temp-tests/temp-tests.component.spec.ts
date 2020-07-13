import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TempTestsComponent } from './temp-tests.component';

describe('TempTestsComponent', () => {
  let component: TempTestsComponent;
  let fixture: ComponentFixture<TempTestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TempTestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TempTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
