import { app } from "electron";

const name = app.getName();

export default {
  label: name,
  submenu: [
    {
      label: 'About ' + name,
      role: 'about'
    },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      }
    },
  ]
};
