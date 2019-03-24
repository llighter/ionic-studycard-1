import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DbService } from 'src/app/services/db.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController, ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { switchMap, tap, shareReplay, map, takeWhile } from 'rxjs/operators';
import { CardFormComponent } from '../card-form/card-form.component';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent implements OnInit {

  // 현재 활성화된 덱
  deck;

  // 현재 활성화된 덱의 카드 목록
  cards;

  filtered;

  // 카드 방향(앞, 뒤) 세팅
  isFront: boolean;

  // 각 스테이지의 카드 개수를 관리하는 변수
  stageCount: number[] = [0, 0, 0, 0, 0, 0];

  // 스테이지 값을 저장
  filter = new BehaviorSubject(null);

  constructor(
    private route: ActivatedRoute
    , public db: DbService
    , public auth: AuthService
    , public modal: ModalController
    , public toastController: ToastController
    , private iab: InAppBrowser
  ) { }

  ngOnInit() {
    this.route.data
      .subscribe((data: { deck: any }) => {
        console.log(JSON.stringify(data));

        // preloard guard로 부터 받아온 데이터를 세팅
        this.deck = data.deck;

        this.isFront = true;
      });

    // TODO: 탭으로 처리하는 여러기능들을 분리할 것
    this.cards = this.auth.user$.pipe(
      switchMap(user =>
        this.db.collection$('cards', ref =>
          ref
            .where('uid', '==', user.uid)
            .where('deckid', '==', this.deck.deckid)
            .orderBy('modifiedDate', 'asc')
        )
      ),
      // TODO: 스테이지별 횟수는 현재 클라이언트에서 관리하지만 나중에는 서버(cloud function)에서 처리할 것
      tap(ref => {
        this.stageCount.forEach((element, stage) => {
          // 사용자가 선택한 스테이지에 해당하는 카드들
          const filteredArr = ref.filter((obj: any) => obj.stage === stage);

          // 해당 카드들의 개수를 업데이트
          this.stageCount[stage] = filteredArr.length;
        });
        console.log(`Total: ${ref.length}, Stage count: ${this.stageCount}`);
      }),
      // 덱스 상태에 변화가 생기면 항상 카드의 방향은 질문이 먼저 보이도록 설정
      tap(_ => this.isFront = true),
      shareReplay(1)
    );

    // Get first item with specific stage
    this.filter.pipe(
      switchMap(stage => {
        return this.cards.pipe(
          map(arr =>
            (arr as any[]).filter(
              obj => (stage ? obj.stage === stage : true)
            )
          )
        );
      })
    ).subscribe(cards => {
      this.filtered = cards[0];
    });
  }

  updateFilter(val) {
    // 스테이지를 변경
    this.filter.next(Number.parseInt(val, 10));
    this.isFront = true;
  }

  async presentCardForm(card?: any) {
    const modal = await this.modal.create({
      component: CardFormComponent,
      componentProps: { card, deck: this.deck }
    });

    return await modal.present();
  }

  flipCard() {
    this.isFront = !this.isFront;
  }

  fillStage() {
    this.cards.pipe(
      // 스테이지가 0 인 카드 목록 가져오기
      map(arr =>
        (arr as any[]).filter(
          obj => obj.stage === 0)
      ),
      // 1번 스테이지가 가득 찼는지 확인
      takeWhile(_ => !this.isStageFull(1))
    ).subscribe(querySnapshot => {
      if (!this.isStageFull(1)) {
        querySnapshot[0].stage = 1;
        querySnapshot[0].modifiedDate = Date.now();
        const id = querySnapshot[0].id;
        delete querySnapshot[0].id;
        this.db.updateAt(`cards/${id}`, querySnapshot[0]);
      }
    });
  }

  isStageFull(stage): boolean {
    let isFull = false;

    switch (stage) {
      case 1:
        isFull = this.stageCount[1] >= 30 ? true : false;
        break;
      case 2:
        isFull = this.stageCount[2] >= 30 * 2 ? true : false;
        break;
      case 3:
        isFull = this.stageCount[3] >= 30 * 5 ? true : false;
        break;
      case 4:
        isFull = this.stageCount[4] >= 30 * 8 ? true : false;
        break;
      case 5:
        isFull = this.stageCount[5] >= 30 * 15 ? true : false;
        break;
    }

    return isFull;
  }

  success() {
    // When the stage of the card is not more than 5 and not full
    if (this.filtered.stage !== 5 && !this.isStageFull(this.filtered.stage + 1)) {
      this.filtered.stage++;
      this.filtered.modifiedDate = Date.now();
      // TODO: implement card history
      // this.filtered.repetition++;

      const id = this.filtered.id;
      delete this.filtered.id;
      console.table({ id, ...this.filtered});
      this.db.updateAt(`cards/${id}`, this.filtered);

      this.presentToast('success', 'success');
    } else {
      this.presentToast('Next stage is full or end of stage...', 'tertiary');
    }

  }

  fail() {
    // When the stage of the card is not 1 and there is room for stage 1
    if (this.filtered.stage !== 1 && !this.isStageFull(1)) {
      this.filtered.stage = 1;
      this.filtered.modifiedDate = Date.now();
      // TODO: implement card history
      // this.filtered.repetition++;
      const id = this.filtered.id;
      delete this.filtered.id;
      console.table({ id, ...this.filtered});
      this.db.updateAt(`cards/${id}`, this.filtered);

      this.presentToast('fail', 'danger');
    } else if (this.filtered.stage === 1) {
      this.filtered.modifiedDate = Date.now();
      // TODO: implement card history
      // this.filtered.repetition++;
      const id = this.filtered.id;
      delete this.filtered.id;
      console.table({ id, ...this.filtered});
      this.db.updateAt(`cards/${id}`, this.filtered);

      this.presentToast('fail', 'danger');
    } else {
      this.presentToast('Stage 1 is full...', 'tertiary');
    }
  }

  // 상황에 따른 메시지를 화면 하단에 뿌려준다
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: true,
      closeButtonText: 'undo',
      duration: 1000,
      color: color
    });
    toast.present();
  }

  // 앱 내에서 링크 열기
  openBrowser(url) {
    // console.log(url);
    const browser = this.iab.create(url);
  }

}
