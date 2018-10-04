import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDonationsComponent } from './user-donations.component';

describe('UserDonationsComponent', () => {
  let component: UserDonationsComponent;
  let fixture: ComponentFixture<UserDonationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDonationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
