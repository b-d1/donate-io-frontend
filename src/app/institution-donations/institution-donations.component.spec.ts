import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyDonationsComponent } from './institution-donations.component';

describe('CompanyDonationsComponent', () => {
  let component: CompanyDonationsComponent;
  let fixture: ComponentFixture<CompanyDonationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyDonationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyDonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
