import { app } from "electron";

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
