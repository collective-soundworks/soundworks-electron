## Todos

- define opening client
- define opening screen size
- `init` script
- clean application menus
    + e.g. cmd + w problem: https://github.com/electron/electron/issues/5536
    + etc.

- user defined app icon
    + https://www.npmjs.com/package/electron-icon-builder

- upload file
- build and deploy for all platforms (at least Mac and Windows)
    + mac, windows, linux
    + check if work if no node.js preinstalled on the machine (it should but...)

## Review

- auto-update stuff
    + https://www.electron.build/auto-update
    + https://github.com/iffy/electron-updater-example
    + https://medium.com/@johndyer24/creating-and-deploying-an-auto-updating-electron-app-for-mac-and-windows-using-electron-builder-6a3982c0cee6 

    + **Requirements**
        * apple sign stuff (needs XCode)
        * github token

    + @note: should release according to target app version, not according to the wrapper version
        * this is possible using
```
"buildVersion": "1.2.3",
"artifactName": "${productName}-${buildVersion}-${arch}.${ext}",
```

        * we can use a .js file that computes the config according to the target app

    + test auto-update locally: https://github.com/electron-userland/electron-builder/issues/3053#issuecomment-401001573

    + signing

        * [**IMPORTANT**!] https://stackoverflow.com/questions/47688943/electron-builder-repeatedly-asks-for-macos-keychain-permissions

    + notarisation appleid.apple.com

        * https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
        * https://twitter-archive-eraser.medium.com/notarize-electron-apps-7a5f988406db (looks good)

## Done

- clean all unused files & dependencies
- doc / README
- code signing

- check compiled dependencies (OSC, XMM, etc.)
    + https://www.electronjs.org/docs/tutorial/using-native-node-modules
    + https://www.electron.build/tutorials/two-package-structure (not used)

    works w/ xmm, in the soundworks app run:
    -> test dev mode ok
    -> test release ok

```sh
  npm install --save-dev electron-rebuild
  # rebuild against the version of electron we use
  ./node_modules/.bin/electron-rebuild -v 13.0.1 
```

- portfinder
    + pass PORT to forked process
    + ok to do `process.env.PORT = 8080;` in `src/main.js`

- explore if we can put the `electron-wrapper` inside the application itself
    + cf. https://www.electron.build/configuration/contents `extraFiles.filter`
    + @todo: define


- codesign --verify --deep --strict --verbose=2 /Users/matuszewski/work/dev/projects/como/como-vox/electron-build/mac/CoMo-Vox.app

    + not the electron version
    + test default output dir // "output": path.join(swAppPath, 'electron-build')
    -> we can copy default output dir somewhere else if needed...

    --> ok with `mac.strictVerify: false,` in electron-builder.js

- configuration script
    + ask for target application path
    + install `electron-rebuild` in target application
    + update package json "from" / "to"
    + create config file w/ target app path, default client for electron
    + consume this file in `src/main.js` to launch the target app
    --> done as deps

- find a clean way to orchestrate server from electron
    + clean target app `server/index`:
```js  
// for electron
process.send('ready');
```
e.g.
```js
// parent.js
child_process.fork('./child', { env : { FORK : 1 } });

// child.js
if (process.env.FORK) {
  console.log('started from fork()');
}
```
    
    + idealy: need a way to send informations back and forth between electron and server
    
- create a `npm run rebuild` that runs `./node_modules/.bin/electron-rebuild` in target application
    + call it in npm `npm run release`
    + process could be something like:

```sh
[target] npm install electron-rebuild
[target] `./node_modules/.bin/electron-rebuild -v [electron version]` 
[electron] npm run release
[target] rm -Rf node_modules
[target] npm install
```

