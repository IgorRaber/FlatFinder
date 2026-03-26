import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatSearch } from './flat-search';

describe('FlatSearch', () => {
  let component: FlatSearch;
  let fixture: ComponentFixture<FlatSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(FlatSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
