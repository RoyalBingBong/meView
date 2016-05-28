import ElectronSettings from "electron-settings";

import Container from "./Container.js";
import AppMenu from "./AppMenu.js"

import * as config from "./config/config.js";

export default class Viewer {
  constructor(viewelemid, indexid, countid, nameid, dropareaid) {
    this.container = new Container();
    // this.settings = new ElectronSettings();

    this.initEventlisteners();

    // Custom Menu
    this.appmenu = new AppMenu(this);

    this.view = document.getElementById(viewelemid);
    this.statusIndex = document.getElementById(indexid);
    this.statusCount = document.getElementById(countid);
    this.statusName = document.getElementById(nameid);
    this.dropzone = document.getElementById(dropareaid);
    this.dropzone.isHidden = false;
    this.initFileDropHandler();
    console.log("viewer created");
  }

  showFile(mediafile) {
    if(mediafile) {
      console.log("showing file");
      console.log(mediafile);
      var elem = mediafile.getElement();
      this.showElement(elem);

      console.log("is autoplay on? ", global.settings.get());
      if(mediafile.isVideo() && global.settings.get("videoSettings.autoplay")) {
        elem.play();
      }
    }
  }

  showElement(elem) {
    if(this.view.hasChildNodes()) {
      this.view.removeChild(this.view.firstChild);
    }
    this.view.appendChild(elem);
  }

  showError(message) {
    var elem = document.createElement("div");
    elem.className = "message";
    elem.innerText = message;
    this.showElement(elem);
  }

  openFile(file) {
    if(file) {
      this.container.open(file);
    }
  }

  updateCurrentFileIndex(current) {
    this.statusIndex.innerText = current+1
  }

  updateCurrentFileCount(count) {
    this.statusCount.innerText = count
  }

  updateCurrentFileName(filename) {
    this.statusName.value = filename;
  }

  updateCurrentDirectory(dirname) {
    console.log("updateCurrentDirectory");
    var appname = require("../package.json").appname;
    document.title = appname + " - " + dirname;
  }

  initEventlisteners() {
    console.log("initEventlisteners");
    var self = this;
    this.container.on("firstFile", function onFirstFile(data) {
      console.log("onFirstFile");
      if(data) {
        // NOTE: onFileAdded will handle the file count update
        self.updateCurrentFileIndex(data.index);
        // self.updateCurrentFileName(data.mediafile.getFilename());
        self.updateCurrentFileName(data.mediafile.filepath);
        self.showFile(data.mediafile);
        self.container.preloadNext(data.index+1)
        self.container.preloadPrevious(data.index-1)
      }
    });
    this.container.on("folderEnd", function onFolderEnd(data) {
      console.log("onFolderEnd");
      if(data) {
        if(data.isEnd) {
          console.log("End-end of file list");
        } else {
          console.log("Start-end of file list");
        }
      }
    });
    this.container.on("fileAdded", function onFileAdded(data) {
      console.log("onFileAdded");
      if(data) {
        self.updateCurrentFileCount(data.filecount)
      }
    });
    this.container.on("currenFileChanged", function onCurrenFileChanged(data) {
      console.log("onCurrenFileChanged");
      if(data) {
        self.updateCurrentFileIndex(data.index);
        // self.updateCurrentFileName(data.mediafile.getFilename())
        self.updateCurrentFileName(data.mediafile.filepath);
        self.showFile(data.mediafile);
      }
    });
    this.container.on("emptyDirectory", function onEmptyDirectory(data) {
      console.log("onEmptyDirectory");
      self.updateCurrentFileIndex(0);
      self.updateCurrentFileCount(0)
      self.updateCurrentFileName(data.filepath);
      self.showError('No file in directory: "' + data.filepath+'"' )
    });
    this.container.on("cwdChanged", function onEmptyDirectory(data) {
      console.log("cwdChanged");
      self.updateCurrentDirectory(data.cwd);
    });
  }

  initFileDropHandler() {
    var self = this;
    var hidden = false;

    window.addEventListener("dragover",function(e){
      e = e || event;
      e.preventDefault();
    },false);
    window.addEventListener("drop",function(e){
      e = e || event;
      e.preventDefault();
    },false);

    // document.body.ondrop = function() {
    //   e.preventDefault()
    //   return false;
    // }
    //
    // document.body.ondragover = function() {
    //   e.preventDefault()
    //   return false;
    // }

    this.dropzone.ondragover = function() {
      self.showDropzone();
      return false;
    }
    this.dropzone.ondragend = function () {
      console.log("ondragend hidden? ", this.isHidden);
      if(this.isHidden) {
        self.hideDropzone();
        // this.className = 'hide';
        // this.visibility = "hidden";
      } else {
        this.className = 'message';
      }
      return false;
    }
    this.dropzone.ondragleave = function () {
      console.log("ondragleave hidden? ", this.isHidden);
      if(this.isHidden) {
        self.hideDropzone();
        // this.className = 'hide';
        // this.visibility = "hidden";
      } else {
        this.className = 'message';
      }
      return false;
    }
    this.dropzone.ondrop = function (e) {
      self.hideDropzone();
      hidden = true;
      e.preventDefault();

      var file = e.dataTransfer.files[0];
      self.container.open(file.path);
      console.log(file);

      return false;
    };
  }

  showDropzone() {
    console.log("show");
    this.dropzone.className = 'message hover';
    this.dropzone.visibility = "visible";
  }

  hideDropzone() {
    console.log("hide");
    this.dropzone.isHidden = true;
    this.dropzone.className = 'message hide';
    this.dropzone.visibility = "hidden";
  }
}
