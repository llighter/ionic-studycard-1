import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

import { Observable, of } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { DbService } from './db.service';

import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;

  constructor(
    private afauth: AngularFireAuth
    , private db: DbService
    , private router: Router
    , private storage: Storage
    , private gplus: GooglePlus
    , private platform: Platform
    , private loadingController: LoadingController
  ) {
    this.user$ = this.afauth.authState.pipe(
      switchMap(user => (user ? db.doc$(`users/${user.uid}`) : of(null)))
    );

    this.handleRedirect();
  }

  // user의 uid(hash value)를 반환한다
  uid() {
    return this.user$
      .pipe(
        take(1),
        map(u => u && u.uid)
      )
      .toPromise();
  }

  // 익명으로 로그인한다
  async anonymousLogin() {
    const credential = await this.afauth.auth.signInAnonymously();

    // 로그인한 계정 정보를 DB에 저장한다
    return await this.updateUserData(credential.user);
  }

  // 계정 정보를 갱신한다
  private updateUserData({ uid, email, displayName, photoURL, isAnonymous }) {
    const path = `users/${uid}`;

    const data = {
      uid
      , email
      , displayName
      , photoURL
      , isAnonymous
    };

    this.db.updateAt(path, data);

    // Root화면으로 이동한다
    return this.router.navigate(['/']);
  }

  // 로그아웃 한다
  async signOut() {
    await this.afauth.auth.signOut();
    return this.router.navigate(['/']);
  }

  // GOOGLE AUTH

  // 로컬 저장소의 authRedirect 값을 설정한다
  setRedirect(val) {
    this.storage.set('authRedirect', val);
  }

  // 로컬 저장소에 저장된 authRedirect 값을 반환한다
  async isRedirect() {
    return await this.storage.get('authRedirect');
  }

  // 구글 로그인을 수행한다
  async googleLogin() {
    try {
      let user;

      // 모바일 기기인 경우
      if (this.platform.is('cordova')) {
        user = await this.nativeGoogleLogin();
        console.log('googleLogin()');
      } else {
        // 웹 브라우저인 경우
        await this.setRedirect(true);
        const provider = new auth.GoogleAuthProvider();
        user = await this.afauth.auth.signInWithRedirect(provider);
      }

      console.table(user);
      // user 정보를 DB에 업데이트한다
      return await this.updateUserData(user);
    } catch (err) {
      console.log(err);
    }
  }

  // Handle login with redirect for web google auth
  private async handleRedirect() {
    if ((await this.isRedirect()) !== true) {
      return null;
    }
    const loading = await this.loadingController.create();
    await loading.present();

    const result = await this.afauth.auth.getRedirectResult();

    if (result.user) {
      await this.updateUserData(result.user);
    }
    await loading.dismiss();

    await this.setRedirect(false);

    return result;
  }

  async nativeGoogleLogin(): Promise<any> {
    console.log('nativeGOogleLogin()');
    const gplusUser = await this.gplus.login({
      webClientId:
        '549242650630-r48mvl89ddfd2ir6vvrlgaabahmbpb6m.apps.googleusercontent.com',
      offline: true,
      scope: 'profile email'
    });

    console.table(gplusUser);
    return await this.afauth.auth.signInWithCredential(
      auth.GoogleAuthProvider.credential(gplusUser.idToken)
    );
  }
}
