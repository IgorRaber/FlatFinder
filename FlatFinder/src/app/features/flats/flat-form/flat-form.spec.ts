import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatForm } from './flat-form';

describe('FlatForm', () => {
  let component: FlatForm;
  let fixture: ComponentFixture<FlatForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatForm],
    }).compileComponents();

    fixture = TestBed.createComponent(FlatForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
