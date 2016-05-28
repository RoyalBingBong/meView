import ElectronSettings from "electron-settings";

import * as config from "../config/config.js";
import mime from "mime"

const settings = new ElectronSettings();


export function errorElement(obj) {
  let errElem = document-createElement("pre");
  errElem.className = "errorElement";
  errElem.innerHTML = JSON.stringify(obj, null, 2);
  return
}

export function applyVideoSettings(videoelement) {
  var videosettings = global.settings.get("videoSettings")
  console.log("videosettings ", videosettings);
  videoelement = applySettings(videoelement, videosettings);
  // disable autoplay so we can preload files that might have auto
  videoelement.autoplay = false;
  return videoelement
}
export function applyImageSettings(imageelement) {
  return applySettings(imageelement, config.imagesettings);
}
function applySettings(elem, setting) {
  console.log("apply settigns to: ", elem);
  for (let key in setting) {
    elem[key] = setting[key];
  }
  return elem;
}

export function applyStyle(element) {
  // TODO: do stuff with custom style here
  element.className = config.defaultStyle;
  return element;
}

export function isArchive(filepath) {
  console.log("isArchive: ", filepath, (/\.(zip|cbz)$/i).test(filepath));
  return (/\.(zip|cbz)$/i).test(filepath);
}


/**
 * getMIMEType - Returns the MIMEType for the passed extension
 *
 * @param  {String} ext Extension, eg ".zip" or ".jpeg"
 * @return {String}     MIMEType
 */
export function getMIMEType(file) {
  return mime.lookup(file);
}

export function isSupportedMIMEType(mimetype) {
  return mimetype.startsWith("image") || config.supportedMIMEType.indexOf(mimetype) > -1
}


export function sortFiles(files) {
  if(process.platform == "win32") {
    // TODO: custom sorting
    return files.sort(function(a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    })
  } else {
    return files.sort();
  }
}
