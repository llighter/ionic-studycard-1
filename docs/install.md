# Install

## 1. Initial setup for firebase native

### Downloard native config file to project directory

Android: `google-services.json`

IOS: `GoogleService-info.plist`

### Install Firebase plug-in

```console
$ ionic cordova plugin add cordova-plugin-firebase
$ npm install @ionic-native/firebase
```

## 2. Initial setup for angularfire

```console
$ npm install firebase @angular/fire --save
```

## 3. Initial setup for Android and IOS

```console
// for android
$ ionic cordova platform add android
// for ios
$ ionic cordova platform add ios
```