# TODO


- autoupdate 
    + https://www.electron.build/auto-update
    + https://github.com/iffy/electron-updater-example

    + https://medium.com/@johndyer24/creating-and-deploying-an-auto-updating-electron-app-for-mac-and-windows-using-electron-builder-6a3982c0cee6 

    + apple sign stuff
    + github token
    + install gh cli [https://github.com/cli/cli](https://github.com/cli/cli)
    
- configuration / orchestration script
    + ask for target application path
    + install `electron-rebuild` in target application
    + update package json "from" / "to"
    + create config file w/ target app path, default client for electron
    + consume this file in `src/main.js` to launch the target app
    
- create a `npm run rebuild` that runs `./node_modules/.bin/electron-rebuild` in target application
    + call it in npm `npm run release`
    + process could be something like:

```sh
[target] npm install electron rebuild
[target] `./node_modules/.bin/electron-rebuild -v [electron version]` 
[electron] npm run release
[electron] sign app, etc.
[electron] create a release
[target] rm -Rf node_modules
[target] npm install
```

- clean application menus
    + e.g. cmd + w problem: https://github.com/electron/electron/issues/5536
    + etc.

- explore if we can put the `electron-wrapper` inside the application itself
    + cf. https://www.electron.build/configuration/contents `extraFiles.filter`

- user defined app icon
    + https://www.npmjs.com/package/electron-icon-builder

- doc / README

- upload file
- code signing
- test
    + mac, windows, linux
    + check if work if no node.js preinstalled on the machine (it should but...)

## Done

- clean all unused files & dependencies

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


