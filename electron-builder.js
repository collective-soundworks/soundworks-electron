const path = require('path');

// this script is somehow executed on post-install so we need to provide defaults
const swAppPath = process.env.swAppPath;
const electronConfig = JSON.parse(process.env.electronConfig);

const config = {
  "productName": electronConfig.productName,
  "buildVersion": electronConfig.buildVersion,
  "artifactName": "${productName}-${buildVersion}-${arch}.${ext}",
  "appId": electronConfig.appId,
  //  "publish": [
  //   {
  //     "provider": "github",
  //     "owner": "b-ma",
  //     "repo": "electron-updater-example"
  //   }
  // ],
  "files": [
    "app/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "directories": {
    "buildResources": "resources",
    "output": path.join(swAppPath, 'electron-build')
  },
  "extraFiles": [
    {
      "from": swAppPath,
      "to": "soundworks-app",
      "filter": [
        "**/*",
        "!.git",
        "!electron-build", // do not copy inside itself
      ].concat(electronConfig.exclude.map((entry) => `!${entry}`)),
    }
  ],
  "mac": {
    "icon": "./resources/icons/mac/icon.icns",
    "hardenedRuntime": true,
    "entitlements": "./entitlements.mac.inherit.plist",
    // this is somehow needed to prevent a weird issue with codesign
    // https://github.com/electron/osx-sign/issues/161
    "strictVerify": false,
    "target": ["dmg", "zip"]
  },
  "afterSign": './after-sign-hook.js',
  "afterPack": async function(context) {
    // override version with buildVersion to match target app version for release
    context.packager.appInfo.version = context.packager.appInfo.buildVersion
    console.log('version:', context.packager.appInfo.version);
    console.log('buildVersion:', context.packager.appInfo.buildVersion);
  },
}

// console.log(config);
module.exports = config;
