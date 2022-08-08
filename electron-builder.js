const path = require('path');

// this script is somehow executed on post-install so we need to provide defaults
const swAppPath = process.env.swAppPath;
const electronConfig = JSON.parse(process.env.electronConfig);
const userIcon = process.env.userIcon === 'true' ? true : false;
const { notarize } = require('electron-notarize-dmg');

console.log(electronConfig);

const config = {
  // override data in @soundworks/electron package.json file
  extraMetadata: {
    version: electronConfig.buildVersion,
    name: electronConfig.name,
  },
  productName: electronConfig.productName,
  buildVersion: electronConfig.buildVersion,
  // @notes
  // - we must remove buildVersion if we want a constant link to last version on github
  // - we must use ${name} instead of ${artifactName} because github replaces ' ' w/ '.'
  // while electron updater replace ' ' w/ '-', at least name is safe
  artifactName: "${name}-${os}-${arch}.${ext}",
  appId: electronConfig.appId,
  publish: electronConfig.publish,
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
        // utf-8-validate and stuff have a this thing that just breaks code signing
        '!**/python3',
        // do not copy inside itself
        '!electron-build',
        '!src',
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
