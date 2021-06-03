
module.exports = {
  "productName": "Soundworks Electron Wrapper Test",
  "buildVersion": "2.3.4",
  "artifactName": "${productName}-${buildVersion}-${arch}.${ext}",
  "appId": "fr.b-ma.soundworks-electron-wrapper",
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
  ]
}
