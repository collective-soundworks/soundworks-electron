# soundworks-electron-wrapper

Minimal wrapper to build Electron applications from existing `soundworks` applications. Derived from [https://github.com/szwacz/electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

__Work in Progress__

## Adding the wrapper to your project

*not completely implemented right now, to be discussed*

```
cd /path/to/your/soundworks/app
git submodule add http://github.com/collective-soundworks/soundworks-electron-wrapper .electron
cd .electron
npm install
npm run init
```

In the soundworks application server code (`src/server/index.js`), make sure the following lines are present in the `launch` IIFE when the server and all experiences are started:

```js
(async function launch() {
    // ...
    server.start();
    myExperience.start();
    // ...
    if (process.env.FORK) {
      process.send('soundworks-ready');
    }
    // ...
}());
```



## Launch application in development mode

```
cd .electron
```

## Features

- auto-update w/ github releases
- 

## Quirks

### Using Native Addons



## Making a release

To package your app into an installer use command:
```
npm run release
```

Once the packaging process finished, the `dist` directory will contain your distributable file.

[Electron-builder](https://github.com/electron-userland/electron-builder) is handling the packaging process. Follow dosc over there to customise your build.

You can package your app cross-platform from a single operating system, [electron-builder kind of supports this](https://www.electron.build/multi-platform-build), but there are limitations and asterisks. That's why this boilerplate doesn't do that by default.
