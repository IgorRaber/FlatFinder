import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatDetail } from './flat-detail';

describe('FlatDetail', () => {
  let component: FlatDetail;
  let fixture: ComponentFixture<FlatDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(FlatDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
