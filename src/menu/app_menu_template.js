import { app } from "electron";
// cannot be done before import in main.js
import config from '../../electron-builder-static.json';
app.setName(config.productName);

const name = app.getName();

export default {
  label: name,
  submenu: [
    {
      label: 'About ' + name,
      role: 'about'
    },
    { type: "separator" },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      }
    },
  ]
};
