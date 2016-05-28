import {remote} from 'electron';

import Viewer from "./Viewer.js";

const viewer = new Viewer(
    "viewercontainer"
  , "currentIndex"
  , "mediaCount"
  , "currentFile"
  , "dropzone"
)

// open file if it was passed as process argv
viewer.openFile(remote.getCurrentWindow().passedFilepath)
