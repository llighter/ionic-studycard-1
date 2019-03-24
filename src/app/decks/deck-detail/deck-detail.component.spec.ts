import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckDetailPage } from './deck-detail.page';

describe('DeckDetailPage', () => {
  let component: DeckDetailPage;
  let fixture: ComponentFixture<DeckDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeckDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
