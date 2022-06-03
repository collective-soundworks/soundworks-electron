# `@soundworks/electron`

> Minimal wrapper to build Electron applications from existing `soundworks` applications. Derived from [https://github.com/szwacz/electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

## Install

```
npm install --save @soundworks/electron
```

create an electron.js file with the following informations

```
const pkg = require('./package.json');

const config = {
  productName: "CoMo Vox",
  buildVersion: pkg.version,
  appId: 'fr.ircam.ismm.como-vox',
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

 make sure you have the following script in your package.json scripts, this command will be used to watch the project in dev mode


```
"watch-build": "soundworks-template-build -b -w",
```



## Commands

### `soundworks-electron init`

- create the

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
