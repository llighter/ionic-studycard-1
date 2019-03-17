import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { ModalController } from '@ionic/angular';
import { switchMap, shareReplay } from 'rxjs/operators';
import { DeckFormComponent } from './deck-form/deck-form.component';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.page.html',
  styleUrls: ['./decks.page.scss'],
})
export class DecksPage implements OnInit {

  constructor(
    public router: Router
    , public db: DbService
    , public auth: AuthService
    , public modal: ModalController
  ) { }

  decks;

  ngOnInit() {
    this.decks = this.auth.user$.pipe(
      switchMap(user =>
        this.db.collection$('decks', ref =>
          ref
            .where('uid', '==', user.uid)
            .orderBy('createdDate', 'desc')
        )
      ),
      shareReplay(1)
    );
  }

  // delete
  deleteDeck(deck: any) {
    this.db.delete(`decks/${deck.id}`);
  }

  // create or modify
  async presentDeckForm(deck?: any) {
    const modal = await this.modal.create({
      component: DeckFormComponent,
      componentProps: { deck }
    });

    return await modal.present();
  }

  trackById(idx, deck) {
    return deck.id;
  }

  moveToDeckDetail(deck: any) {
    // TODO: 절대경로가 아닌 상대경로로 설정해야하지 않을까?
    this.router.navigate(['tabs', 'decks', deck.id]);
  }

}
