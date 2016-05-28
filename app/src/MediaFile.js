'use strict';

import * as helper from "./helper/helper.js"

export default class MediaFile {

  constructor(filename, filepath, mimetype, zipentry) {
    this.filename = filename;
    this.filepath = filepath;
    this.mimetype = mimetype;
    this.zipentry = zipentry;
  }

  isVideo() {
    return this.mimetype.startsWith("video");
  }

  isImage() {
    return this.mimetype.startsWith("image");
  }

  isBuffer() {
    return !!this.buffer;
  }

  getFilename() {
    return this.filename
  }

  getElement() {
    let elem;
    if(this.isImage()) {
      // create img element;
      elem = new Image();
      helper.applyImageSettings(elem);
    } else if(this.isVideo()) {
      elem = document.createElement("video");
      helper.applyVideoSettings(elem);
    } else {
      return helper.errorElement(this);
    }
    helper.applyStyle(elem);
    elem.src = this.getSrc();
    return elem;
  }


  getSrc() {
    if(this.zipentry) {
      return "data:" + this.mimetype + ";base64," + this.zipentry.getData().toString("base64")
    } else {
      return this.filepath;
    }
  }


}
