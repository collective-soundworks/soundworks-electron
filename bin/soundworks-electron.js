#!/usr/bin/env node
const path = require('path');
const { execSync, spawn } = require('child_process');

const chalk = require('chalk');

const swAppPath = process.cwd();
const swElectronPath = path.join(__dirname, '..');


(async function run() {
  console.log('');
  console.log(chalk.cyan(`+ Building app in ${swAppPath}`));

  // // get current electron version
  // const electronVersion = execSync(`electron -v`, {
  //   cwd: swElectronPath,
  // }).toString().replace(/^v/, '');

  // // rebuild deps against electron
  // console.log('');
  // console.log(chalk.cyan(`+ Rebuild dependancies for electron@${electronVersion}`));

  // async function rebuildDeps() {
  //   return new Promise((resolve, reject) => {
  //     // https://github.com/electron/electron-rebuild#cli-arguments
  //     // `electron-rebuild -v ${electronVersion} -m ${swAppPath}`
  //     const rebuild = spawn('electron-rebuild', [
  //       '-v', electronVersion,
  //       '-m', swAppPath,
  //     ], {
  //       cwd: swAppPath,
  //     });

  //     rebuild.stdout.on('data', (data) => process.stdout.write(data.toString()));
  //     rebuild.stderr.on('data', (data) => process.stdout.write(data.toString()));
  //     rebuild.on('close', (code) => code === 0 ? resolve() : reject());
  //   });
  // }

  // await rebuildDeps();

  // rebuild target soundworks app
  console.log('');
  console.log(chalk.cyan(`+ Build soundworks application`));

  // async function rebuildSoundworksApp() {
  //   return new Promise((resolve, reject) => {
  //     const rebuild = spawn('npm', ['run', 'build'], {
  //       cwd: swAppPath,
  //     });

  //     rebuild.stdout.on('data', (data) => process.stdout.write(data.toString()));
  //     rebuild.stderr.on('data', (data) => process.stdout.write(data.toString()));
  //     rebuild.on('close', (code) => code === 0 ? resolve() : reject());
  //   });
  // }

  // await rebuildSoundworksApp();

  // rebuild target soundworks app
  console.log('');
  console.log(chalk.cyan(`+ Launch electron dev`));

  // grab electron infos in target app
  const electronConfigPathAbs = path.join(swAppPath, '.electron.js');
  const electronConfigPathRel = path.relative(__dirname, electronConfigPathAbs);
  const electronConfig = require(electronConfigPathRel);

  // async function electronDev() {

  //   // watch and build soundworks app
  //   const swBuildWatch = spawn('npm', ['run', 'watch-build'], {
  //     cwd: swAppPath,
  //   });

  //   swBuildWatch.stdout.on('data', (data) => process.stdout.write(data.toString()));
  //   swBuildWatch.stderr.on('data', (data) => process.stdout.write(data.toString()));
  //   // swBuildWatch.on('close', (code) => code === 0 ? resolve() : reject());

  //   // run electron in dev mode
  //   const runElectronDev = spawn('npm', ['run', 'dev'], {
  //     cwd: swElectronPath,
  //     env: Object.assign(process.env, {
  //       swAppPath,
  //       electronConfig: JSON.stringify(electronConfig),
  //     }),
  //   });

  //   runElectronDev.stdout.on('data', (data) => process.stdout.write(data.toString()));
  //   runElectronDev.stderr.on('data', (data) => process.stdout.write(data.toString()));
  //   // runElectronDev.on('close', (code) => code === 0 ? resolve() : reject());
  // }

  // await electronDev();


  console.log('');
  console.log(chalk.cyan(`+ Launch electron build`));

  async function electronBuild() {
    return new Promise((resolve, reject) => {
        // run electron in dev mode
      const runElectronBuild = spawn('npm', ['run', 'build'], {
        cwd: swElectronPath,
        env: Object.assign(process.env, {
          swAppPath,
          electronConfig: JSON.stringify(electronConfig),
        }),
      });

      runElectronBuild.stdout.on('data', (data) => process.stdout.write(data.toString()));
      runElectronBuild.stderr.on('data', (data) => process.stdout.write(data.toString()));
      runElectronBuild.on('close', (code) => code === 0 ? resolve() : reject());
    });
  }

  electronBuild();

}());

// const electronVersion = execSync();

// run electron-rebuild in main project

