import {remote} from 'electron';

import ElectronSettings from "electron-settings";

import Viewer from "./Viewer.js";

import "./helper/helper"; // import for caching purposes

import {writeDefaultSettings} from "./controller.js";



writeDefaultSettings();


const viewer = new Viewer(
    "viewercontainer"
  , "currentIndex"
  , "mediaCount"
  , "currentFile"
  , "dropzone"
)



// open file if it was passed as process argv
viewer.openFile(remote.getCurrentWindow().passedFilepath)

document.body.ondblclick = function() {
  remote.getCurrentWindow().setFullScreen(!remote.getCurrentWindow().isFullScreen());
}
