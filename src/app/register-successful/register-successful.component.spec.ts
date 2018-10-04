import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSuccessfulComponent } from './register-successful.component';

describe('RegisterSuccessfulComponent', () => {
  let component: RegisterSuccessfulComponent;
  let fixture: ComponentFixture<RegisterSuccessfulComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterSuccessfulComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterSuccessfulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
