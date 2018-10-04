import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { G2faAuthComponentComponent } from './g2fa-auth.component';

describe('G2faAuthComponentComponent', () => {
  let component: G2faAuthComponentComponent;
  let fixture: ComponentFixture<G2faAuthComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ G2faAuthComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(G2faAuthComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
