import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DecksPage } from './decks.page';
import { AuthGuard } from '../guards/auth.guard';
import { DeckFormComponent } from './deck-form/deck-form.component';
import { DeckDetailComponent } from './deck-detail/deck-detail.component';
import { PreloardGuard } from '../guards/preloard.guard';
import { CardFormComponent } from './card-form/card-form.component';

const routes: Routes = [
  {
    path: '',
    component: DecksPage,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: DeckDetailComponent,
    resolve: {
      deck: PreloardGuard
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DecksPage, DeckFormComponent, DeckDetailComponent, CardFormComponent],
  entryComponents: [DeckFormComponent, CardFormComponent]
})
export class DecksPageModule {}
