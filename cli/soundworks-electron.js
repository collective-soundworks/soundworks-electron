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
    //
    const configModel = `\
const pkg = require('./package.json');

const config = {
  // do not touch these ones
  // keep versionning synchronized with the current repo
  name: pkg.name,
  buildVersion: pkg.version,
  // product infos
  productName: "Soundworks Test",
  author: "Ircam ISMM",
  appId: 'fr.ircam.ismm.electron-test',
  // auto-update config
  publish: {
    provider: 'github',
    owner: 'collective-soundworks',
    repo: 'soundworks-electron-test',
  },
  // uncomment to use app specific icon
  // icon: './media/icon.png',
  // list of files or directories that we don't want to include in the binary
  // by default the whole application except the .git directory is copied
  exclude: [
    // 'resources',
    // ...
  ]
}

module.exports = config;
    `

    const electronConfigFilepath = path.join(swAppPath, '.electron.cjs');

    if (!fs.existsSync(electronConfigFilepath)) {
      fs.writeFileSync(electronConfigFilepath, configModel);
      console.log(chalk.cyan(`> File "${electronConfigFilepath}"successfully written`));
    }


    // env file
    const electronEnvConfig = `\
{
  type: 'electron',
  port: 8000,
  assetsDomain: '',
  websockets: {
    path: 'socket',
    url: '',
    pingInterval: 5000
  },
  useHttps: false,
  httpsInfos: {
    key: null,
    cert: null,
  },
}
    `

    const electronEnvFilepath = path.join(swAppPath, 'config', 'env', 'electron.json');

    if (!fs.existsSync(electronEnvFilepath)) {
      fs.writeFileSync(electronEnvFilepath, electronEnvConfig);
      console.log(chalk.cyan(`> Env File "${electronEnvFilepath}" successfully written`));
    }

    // add `electron-build to .gitignore`
    const gitignorePath = path.join(swAppPath, '.gitignore');
    fs.appendFileSync(gitignorePath, `
# @soundworks/electron
electron-build
`);
    console.log(chalk.cyan(`> Added electron-build to .gitignore`));


    const packagePath = path.join(swAppPath, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath));

    if (!pkg.scripts['watch-build']) {
      // @todo - review, this does not really work...
      pkg.scripts['watch-build'] = "concurrently -p \"soundworks-template-build -b -w\" \"npm run watch-sass\""
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

      console.log(chalk.cyan(`> Added "watch-build" script to package.json`));
    }

    console.log(`Make sure to add the following lines in "src/server/index.js":
\`\`\`
if (process.env.ENV === 'electron') {
  process.send(JSON.stringify({
    type: 'soundworks:ready',
    payload: {},
  }));
}
\`\`\`
`);

    return;
  }

  // --------------------------------------------------------
  // CHECK THAT ELECTRON FILE EXISTS IN TARGET APP
  const electronFile = path.join(swAppPath, '.electron.cjs');

  if (!fs.existsSync(electronFile)) {
    console.log(chalk.yellow('> ".electron.cjs" file was not found.'));
    console.log(chalk.yellow('> Please run `soundworks-electron init` first'));
    return;
  }

  // --------------------------------------------------------

  console.log('');
  console.log(chalk.green(`> Building app in ${swAppPath}`));

  // --------------------------------------------------------
  // GET CURRENT ELECTRON VERSION
  const electronVersion = pkg.devDependencies.electron.replace(/^\^/, '');
  // --------------------------------------------------------

  // --------------------------------------------------------
  // REBUILD DEPS AGAINST ELECTRON
  console.log('');
  console.log(chalk.cyan(`+ Rebuild dependencies for electron@${electronVersion}`));

  // @note - maybe this could be replaced with: `electron-builder node-gyp-rebuild`
  // see https://www.electron.build/cli.html
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

  await rebuildDeps();
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

  await rebuildSoundworksApp();
  // --------------------------------------------------------


  // --------------------------------------------------------
  // GRAB ELECTRON INFOS IN TARGET APP
  const electronConfigPathAbs = path.join(swAppPath, '.electron.cjs');
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

    try {
      electronBuild();
    } catch(err) {
      console.log(err);
    }
    // --------------------------------------------------------
  }

}());

