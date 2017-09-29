import "./modules/UserSettings.js"
import "./modules/Viewer.js"
import "./modules/Locale.js"
import Window from "./modules/Window.js"

window.onbeforeunload = () => {
  Window.beforeUnload()
  Window.closeOtherWindows()
}
