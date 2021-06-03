// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, ipcMain, shell } from 'electron';
import appMenuTemplate from './menu/app_menu_template';
import editMenuTemplate from './menu/edit_menu_template';
import devMenuTemplate from './menu/dev_menu_template';
import createWindow from './helpers/window';
import portfinder from 'portfinder'
import pkg from '../package.json';
import { fork } from 'child_process';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from 'env';

// disable security warnings, we only load content we know here
// cf. https://www.electronjs.org/docs/tutorial/security
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 1;

let port = 8000; // default port
let soundworksAppPath = null;
let soundworksApp = null;

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
  // prod see package.json extraFiles
  soundworksAppPath = path.resolve(path.join(process.cwd(), pkg.build.extraFiles[0].from));

  log.info('> target soundworks app path:', soundworksAppPath);
  log.info(process.versions);
} else {
  soundworksAppPath = path.resolve(path.join(process.resourcesPath, '..', pkg.build.extraFiles[0].to));
}

// application menu (cmd + w problem): https://github.com/electron/electron/issues/5536
const setApplicationMenu = () => {
  const menus = [appMenuTemplate, editMenuTemplate];
  if (env.name !== 'production') {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// log auto update stuff
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  log.info('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.');
});
autoUpdater.on('error', (err) => {
  log.info('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
});

app.on('ready', async () => {
  // this will immediately download an update, then install when the app quits.
  // cf. https://github.com/iffy/electron-updater-example
  autoUpdater.checkForUpdatesAndNotify();
  // find an available port if 8000 already in use
  try {
    port = await portfinder.getPortPromise();
  } catch(err) {
    log.info(err);
  }

  process.env.PORT = port;
  // run soundworks server
  soundworksApp = fork('.build/server/index.js', {
    cwd: soundworksAppPath
  });

  soundworksApp.on('message', msg => {
    // the server is running
    if (msg === 'ready') {
      setApplicationMenu();

      const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        backgroundColor: '#000000',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      // @todo - get port from config
      const swClientUrl = `http://localhost:${process.env.PORT}`;
      mainWindow.loadURL(swClientUrl);

      if (env.name === 'development') {
        mainWindow.openDevTools();
      }
    }
  });

  log.info('[soundworks pid]', soundworksApp.pid);
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (soundworksApp !== null) {
    log.info('terminate soundworks server', soundworksApp.pid);
    soundworksApp.kill();
  }
});

