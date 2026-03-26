import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatMessages } from './flat-messages';

describe('FlatMessages', () => {
  let component: FlatMessages;
  let fixture: ComponentFixture<FlatMessages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatMessages],
    }).compileComponents();

    fixture = TestBed.createComponent(FlatMessages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
