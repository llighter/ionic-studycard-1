import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecksPage } from './decks.page';

describe('DecksPage', () => {
  let component: DecksPage;
  let fixture: ComponentFixture<DecksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecksPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
