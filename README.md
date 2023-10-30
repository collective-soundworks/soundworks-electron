# `@soundworks/electron`

> Minimal wrapper to build Electron applications from existing `soundworks` applications. Derived from [https://github.com/szwacz/electron-boilerplate](https://github.com/szwacz/electron-boilerplate).

## Install

```sh
npm install --save-dev @soundworks/electron
```

create an `.electron.cjs` file at the root of your application with the following informations:

```js
const pkg = require('./package.json');

const config = {
  productName: "My App",
  // keep versionning synchronized with the current repo
  buildVersion: pkg.version,
  appId: 'fr.ircam.ismm.my-app',
  icon: './media/icon.png',
  // to be fixed confirmed...
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

```json
"watch-build": "soundworks-build -b -w",
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

## Release

### Mac

To build a release for Mac, you should have a valid Certificate installed on your machine

Trouble shooting:

- check codesign

```
codesign --verify --deep --verbose ./electron-build/mac/CoMo\ Vox.app/
```

- check notarization

```
spctl -a -t exec -vvv electron-build/mac/CoMo\ Vox.app/
```

output
```
# on the machine where the build has been done
spctl -a -t exec -v /path/to/notarised.app
source=Notarized Developer ID

# on another machine (not sure of this one)
spctl -a -t exec -v /path/to/not_notarised.app
source=Developer ID
```

These checks should be done both on the dev machine and on another one after 
download to check gatekeeper behavior.

## Auto-update

auto update seems to be automatically done from .git/config infos
https://github.com/iffy/electron-updater-example

to be tested

## Todos

- build for windows (and linux ?)
- automate releases

## License

BSD-3-Clause
