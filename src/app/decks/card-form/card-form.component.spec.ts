import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFormPage } from './card-form.page';

describe('CardFormPage', () => {
  let component: CardFormPage;
  let fixture: ComponentFixture<CardFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
