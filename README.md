# soundworks-electron-wrapper

Minimal wrapper to build Electron applications from existing `soundworks#3` applications. Derived from [https://github.com/szwacz/electron-boilerplate](https://github.com/szwacz/electron-boilerplate)
Minimalistic, very easy to understand boilerplate for [Electron runtime](https://www.electronjs.org/). Tested on Windows, macOS and Linux.  

This project contains only bare minimum of tooling and dependencies to provide you with simple to understand and extensible base (but still, this is fully functional Electron environment). The boilerplate doesn't impose on you any frontend technologies, so feel free to pick your favourite.

## Quick start

init-script

## Development

Binaries

## Making a release

To package your app into an installer use command:
```
npm run release
```

Once the packaging process finished, the `dist` directory will contain your distributable file.

[Electron-builder](https://github.com/electron-userland/electron-builder) is handling the packaging process. Follow dosc over there to customise your build.

You can package your app cross-platform from a single operating system, [electron-builder kind of supports this](https://www.electron.build/multi-platform-build), but there are limitations and asterisks. That's why this boilerplate doesn't do that by default.
