#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');
const pkg = require('../package.json');

const swAppPath = process.cwd();
const swElectronPath = path.join(__dirname, '..');

const cmd = process.argv[2];

if (['init', 'dev', 'build'].indexOf(cmd) === -1) {
  console.log(chalk.red(`> soundworks-electron command "${cmd}" not found, valid command are "init", "dev" and "build"`));
  return;
}

(async function run() {

  if (cmd === 'init') {
    console.log(chalk.yellow('> `soundworks-electron init` not yet implemented, check the README'));
    return;
  }

  console.log('');
  console.log(chalk.green(`> Building app in ${swAppPath}`));

  // --------------------------------------------------------
  // GET CURRENT ELECTRON VERSION
  const electronVersion = pkg.devDependencies.electron.replace(/^\^/, '');
  // this doesn't work on windows...
  // const electronVersion = execSync(`npx electron -v`, {
  //   cwd: swElectronPath,
  // }).toString().replace(/^v/, '');
  // --------------------------------------------------------


  // --------------------------------------------------------
  // REBUILD DEPS AGAINST ELECTRON
  console.log('');
  console.log(chalk.cyan(`+ Rebuild dependencies for electron@${electronVersion}`));

  async function rebuildDeps() {
    return new Promise((resolve, reject) => {
      // https://github.com/electron/electron-rebuild#cli-arguments
      // `electron-rebuild -v ${electronVersion} -m ${swAppPath}`
      const cmd = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
      const rebuild = spawn(cmd, [
        'electron-rebuild',
        '-v', electronVersion,
        '-m', swAppPath,
      ], {
        cwd: swAppPath,
      });

      rebuild.stdout.on('data', (data) => process.stdout.write(data.toString()));
      rebuild.stderr.on('data', (data) => process.stdout.write(data.toString()));
      rebuild.on('close', (code) => code === 0 ? resolve() : reject());
    });
  }

  // await rebuildDeps();
  // --------------------------------------------------------

  // --------------------------------------------------------
  // REBUILD TARGET SOUNDWORKS APP
  console.log('');
  console.log(chalk.cyan(`+ Build soundworks application`));

  async function rebuildSoundworksApp() {
    return new Promise((resolve, reject) => {
      const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
      const rebuild = spawn(cmd, ['run', 'build'], {
        cwd: swAppPath,
      });

      rebuild.stdout.on('data', (data) => process.stdout.write(data.toString()));
      rebuild.stderr.on('data', (data) => process.stdout.write(data.toString()));
      rebuild.on('close', (code) => code === 0 ? resolve() : reject());
    });
  }

  // await rebuildSoundworksApp();
  // --------------------------------------------------------


  // --------------------------------------------------------
  // GRAB ELECTRON INFOS IN TARGET APP
  const electronConfigPathAbs = path.join(swAppPath, '.electron.js');
  const electronConfigPathRel = path.relative(__dirname, electronConfigPathAbs);
  const electronConfig = require(electronConfigPathRel);


  // --------------------------------------------------------
  // CREATE STATIC CONFIG FILE
  // in production we won't have the `process.env` set
  console.log('');
  console.log(chalk.cyan(`+ Create "electron-builder-static.json" static config file`));

  const createStateConfigFile = spawn('node', ['./electron-builder-make-static.js'], {
    cwd: swElectronPath,
    env: Object.assign(process.env, {
      swAppPath,
      electronConfig: JSON.stringify(electronConfig),
    }),
  });

  createStateConfigFile.stdout.on('data', (data) => process.stdout.write(data.toString()));
  createStateConfigFile.stderr.on('data', (data) => process.stdout.write(data.toString()));
  // --------------------------------------------------------


  if (cmd === 'dev') {
    // --------------------------------------------------------
    // rebuild target soundworks app
    console.log('');
    console.log(chalk.cyan(`+ Launch electron dev`));

    async function electronDev() {

      // watch and build soundworks app
      const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
      const swBuildWatch = spawn(cmd, ['run', 'watch-build'], {
        cwd: swAppPath,
      });

      swBuildWatch.stdout.on('data', (data) => process.stdout.write(data.toString()));
      swBuildWatch.stderr.on('data', (data) => process.stdout.write(data.toString()));
      // swBuildWatch.on('close', (code) => code === 0 ? resolve() : reject());

      // run electron in dev mode
      const runElectronDev = spawn(cmd, ['run', 'dev'], {
        cwd: swElectronPath,
        env: Object.assign(process.env, {
          swAppPath,
          electronConfig: JSON.stringify(electronConfig),
        }),
      });

      runElectronDev.stdout.on('data', (data) => process.stdout.write(data.toString()));
      runElectronDev.stderr.on('data', (data) => process.stdout.write(data.toString()));
      // runElectronDev.on('close', (code) => code === 0 ? resolve() : reject());
    }

    await electronDev();
    // --------------------------------------------------------
  }


  if (cmd === 'build') {
    // --------------------------------------------------------
    let userIcon = false;

    // if user define icon defined, create all formats
    if (electronConfig.icon && fs.existsSync(path.join(swAppPath, electronConfig.icon))) {
      // --------------------------------------------------------
      console.log('');
      console.log(chalk.cyan(`+ Create icons`));

      async function createIcons() {
        return new Promise((resolve, reject) => {
          const cmd = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
          const runCreateIcons = spawn(cmd, [
            'electron-icon-builder',
            `--input=${path.join(swAppPath, electronConfig.icon)}`,
            `--output=${path.join(swElectronPath, 'resources', 'user')}`
          ], {
            cwd: swElectronPath,
          });

          runCreateIcons.stdout.on('data', (data) => process.stdout.write(data.toString()));
          runCreateIcons.stderr.on('data', (data) => process.stdout.write(data.toString()));
          runCreateIcons.on('close', (code) => code === 0 ? resolve() : reject());
        });
      }

      createIcons();
      userIcon = true;
    } else {
      console.log('');
      console.log(chalk.cyan(`+ No user icon defined, skip`));
      // --------------------------------------------------------
    }


    // --------------------------------------------------------
    console.log('');
    console.log(chalk.cyan(`+ Launch electron build`));

    async function electronBuild() {
      return new Promise((resolve, reject) => {
        const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        const runElectronBuild = spawn(cmd, ['run', 'build'], {
          cwd: swElectronPath,
          env: Object.assign(process.env, {
            electronConfig: JSON.stringify(electronConfig),
            swAppPath,
            userIcon,
          }),
        });

        runElectronBuild.stdout.on('data', (data) => process.stdout.write(data.toString()));
        runElectronBuild.stderr.on('data', (data) => process.stdout.write(data.toString()));
        runElectronBuild.on('close', (code) => code === 0 ? resolve() : reject());
      });
    }

    electronBuild();
    // --------------------------------------------------------
  }

}());

