const path = require('path');

// this script is somehow executed on post-install so we need to provide defaults
const swAppPath = process.env.swAppPath;
const electronConfig = JSON.parse(process.env.electronConfig);
const userIcon = process.env.userIcon === 'true' ? true : false;
const { notarize } = require('electron-notarize-dmg');

const config = {
  productName: electronConfig.productName,
  buildVersion: electronConfig.buildVersion,
  // buildNumber: electronConfig.buildNumber,
  artifactName: "${productName}-${buildVersion}-${os}-${arch}.${ext}",
  appId: electronConfig.appId,
  // "publish": [
  //   {
  //     "provider": "github",
  //     "owner": "b-ma",
  //     "repo": "electron-updater-example"
  //   }
  // ],
  files: [
    'app/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  directories: {
    buildResources: 'resources',
    output: path.join(swAppPath, 'electron-build')
  },
  extraFiles: [
    {
      from: swAppPath,
      to: 'soundworks-app',
      filter: [
        '**/*',
        '!.git',
        // do not copy inside itself
        '!electron-build',
        // in dev, these can be symlinks that break codesign check
        '!node_modules/.bin',
        '!node_modules/@soundworks/electron',
      ].concat(electronConfig.exclude.map((entry) => `!${entry}`)),
    }
  ],
  mac: {
    icon: `./resources/${userIcon ? 'user/icons' : 'icons'}/mac/icon.icns`,
    // cf. https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: './entitlements.mac.inherit.plist',
    entitlementsInherit: './entitlements.mac.inherit.plist',
    // this is somehow needed to prevent a weird issue with codesign
    // https://github.com/electron/osx-sign/issues/161
    // strictVerify: false,
    target: ['dmg', 'zip'],
  },
  win: {
    target: 'nsis',
    icon: `./resources/${userIcon ? 'user/icons' : 'icons'}/win/icon.ico`,
  },
  nsis: {
    deleteAppDataOnUninstall: true,
    // include: "installer/win/nsis-installer.nsh"
  },
  afterSign: './after-sign-hook.js',
  afterPack: async function(context) {
    // override version with buildVersion to match target app version for release
    context.packager.appInfo.version = context.packager.appInfo.buildVersion;
  },
}

module.exports = config;
