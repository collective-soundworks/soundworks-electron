// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db
const fs = require('fs');
const path = require('path');

const electronConfig = JSON.parse(process.env.electronConfig);
const electronNotarize = require('electron-notarize');

module.exports = async function (params) {
    // notarize app on Mac OS only.
  if (process.platform !== 'darwin' ||
    !process.env.appleId ||
    !process.env.appleIdPassword ||
    !process.env.teamId
  ) {
    if (process.platform === 'darwin') {
      console.log('[Error] Abort application notarization');
      console.log('appleId:', process.env.appleId);
      console.log('appleIdPassword:', process.env.appleIdPassword);
      console.log('teamId:', process.env.teamId);
    }
    return;
  }

  // console.log('afterSign hook triggered', params);
  console.log('> afterSign hook triggered');

  // Same appId in electron-builder.
  let appId = electronConfig.appId;

  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);

  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`> Notarizing ${appId} in ${appPath}`);

  try {
    const config = {
      tool: 'notarytool',
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.appleId,
      appleIdPassword: process.env.appleIdPassword,
      teamId: process.env.teamId,
    };

    console.log('notarization config:', config);

    await electronNotarize.notarize(config);
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
