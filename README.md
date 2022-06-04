# `@soundworks/electron`

> Minimal wrapper to build Electron applications from existing `soundworks` applications. Derived from [https://github.com/szwacz/electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

## Install

```
npm install --save-dev @soundworks/electron
```

create an `.electron.js` file at the root of your application with the following informations:

```
const pkg = require('./package.json');

const config = {
  // avoid spaces in product name, this crashes the build process
  productName: "My-App",
  // keep versionning synchronized
  buildVersion: pkg.version,
  appId: 'fr.ircam.ismm.my-app',
  // to be fixed
  publish: [
    {
      provider: 'github',
      owner: 'ircam-ismm',
      reop: 'como-vox',
    }
  ],
  // list of files or directories that we don't want to include in the binary
  // by default the whole application except the .git directory is copied
  exclude: [
    'resources',
    // ...
  ]
  // @todos
  // icons, etc.
}

module.exports = config;
```

Make sure you have the following script in your `package.json`, this command is used by `@soundworks/electron` to watch and build the soundworks project in dev mode.

```
"watch-build": "soundworks-template-build -b -w",
```

The wrapped application server should send an event to the electron process when ready,
so that the GUI can be launched safely.

```
if (process.env.ENV === 'electron') {
  process.send(JSON.stringify({
    type: 'soundworks:ready',
    payload: {},
  }));
}
```

## Commands

### `soundworks-electron init` (@todo)

- generate the `.electron.js` file
- add the npm script command in package.json if not exists
- add a default icon
- add `electron-build` directory to `.gitignore`

### `soundworks-electron dev`

- run electron in dev mode, the host soundworks application is watch and transpiled
- be aware that if you modify server side files, you will have to relaunch

### `soundworks-electron build`

- build the application

## code-signing

@todo - check electron-builder documenttation

## Todos

- icons
- build for windows (and linux ?)
- automate releases

## License

BSD-3-Clause
