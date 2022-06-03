// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db
const fs = require('fs');
const path = require('path');
const electronBuilderConfig = require('./electron-builder.js');
const electronNotarize = require('electron-notarize');

module.exports = async function (params) {
    // notarize app on Mac OS only.
    if (process.platform !== 'darwin' ||
        !process.env.appleId ||
        !process.env.appleIdPassword
    ) {
        return;
    }

    console.log('afterSign hook triggered', params);

    // Same appId in electron-builder.
    let appId = electronBuilderConfig.appId;

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    if (!fs.existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`);
    }

    console.log(`Notarizing ${appId} found at ${appPath}`);

    try {
      const config = {
          appBundleId: appId,
          appPath: appPath,
          appleId: process.env.appleId,
          appleIdPassword: process.env.appleIdPassword,
      };

      console.log(config);
      await electronNotarize.notarize(config);
    } catch (error) {
        console.error(error);
    }

    console.log(`Done notarizing ${appId}`);
};
