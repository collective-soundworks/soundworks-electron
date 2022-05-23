
module.exports = {
  "productName": "Soundworks Electron Test",
  // "version": "0.0.3",
  "buildVersion": "0.0.3",
  "artifactName": "${productName}-${buildVersion}-${arch}.${ext}",
  "appId": "fr.ircam.ismm.electron-test",
  "publish": [
    {
      "provider": "github",
      "owner": "b-ma",
      "repo": "electron-updater-example"
    }
  ],
  "files": [
    "app/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "directories": {
    "buildResources": "resources"
  },
  "extraFiles": [
    {
      "from": "../soundworks-electron-test-app",
      "to": "soundworks-app",
      "filter": [
        "**/*",
        "!.electron"
      ]
    }
  ],
  "mac": {
    "icon": "./resources/icon.icns",
    "hardenedRuntime": true,
    "entitlements": "./entitlements.mac.inherit.plist",
    "target": ["dmg", "zip"]
  },
  "afterSign": './after-sign-hook.js',
  afterPack: async function(context) {
    // override version with buildVersion to match target app version for release
    context.packager.appInfo.version = context.packager.appInfo.buildVersion
    console.log('version:', context.packager.appInfo.version);
    console.log('buildVersion:', context.packager.appInfo.buildVersion);
  },
}
