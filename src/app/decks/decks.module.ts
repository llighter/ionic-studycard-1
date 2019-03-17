import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DecksPage } from './decks.page';
import { AuthGuard } from '../guards/auth.guard';
import { DeckFormComponent } from './deck-form/deck-form.component';
import { DeckDetailComponent } from './deck-detail/deck-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DecksPage,
    canActivate: [AuthGuard]
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
  declarations: [DecksPage, DeckFormComponent, DeckDetailComponent],
  entryComponents: [DeckFormComponent]
})
export class DecksPageModule {}
