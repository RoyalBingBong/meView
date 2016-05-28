import EventEmitter from "events";

// import * as fs from "fs";
import {readdir as fsreaddir, stat as fsstat} from "fs";
import {basename, dirname, extname, join} from "path"
import {format} from "util";

// import * as AdmZip from "adm-zip"
var AdmZip = require('adm-zip');

import MediaFile from "./MediaFile.js";
import * as helper from "./helper/helper.js"


const PRELOADRANGE = 0;

export default class Container extends EventEmitter {
  constructor() {
    super();
    this.cwd = ".";       // current directory
    this.parentDir = ".";
    this.siblings = [];  // all sibling directories
    this.children = [];  // all directories and zips
    this.files = [];     // all MediaFiles
    this._currentIndex = 0;
    console.log("Container created");
  }

  open(fileorpath) {
    console.log("open: ", fileorpath);
    var self = this;
    var oldCWD = this.cwd;
    var oldParendDir = this.parentDir;

    fsstat(fileorpath, function(err, stats) {
      if(err) {
        var message = format('Viewer#open: could not get stats for "%s"', fileorpath)
        throw new Error(message)
      }
      if(stats.isFile()) {
        if(helper.isArchive(fileorpath)) {
          console.log("open isFile and isArchive: ", fileorpath);
          self.parentDir = dirname(fileorpath);
          self.cwd = fileorpath;
          self.viewArchive(fileorpath);
        } else {
          self.parentDir = join(dirname(fileorpath), "..");
          self.cwd = dirname(fileorpath);
          self.viewDirectory(self.cwd, fileorpath);
        }
      } else if(stats.isDirectory()) {
        self.parentDir = join(fileorpath, "..");
        self.cwd = fileorpath;
        self.viewDirectory(self.cwd);
      }

      if(oldParendDir != self.parentDir) {
        console.log('parentDir changed from "%s" to "%s"', oldParendDir, self.parentDir);
        self.fetchSiblings();
      }

      if(oldCWD != self.cwd) { // cwd changed thus update siblings
        self.emit("cwdChanged", {
          cwd: self.cwd
        });
      }
    })
  }

  viewDirectory(dir, showfile) {
    console.log("viewDirectory");
    var self = this;
    var firstTriggered = false;
    fsreaddir(dir, function(err, files) {
      if(err) {
        var message = format('failed to read directory "%s"', dir)
        throw new Error(message);
      }

      if(files.length == 0) {
        self.emit("emptyDirectory", {
          filepath: dir
        });
      }

      self.files = [];
      self.children = [];
      files = files.map(function(f) {
        return join(self.cwd, f);
      })

      // files = files.sort();
      files = helper.sortFiles(files);

      files.forEach(function(file) {
        fsstat(file, function(err,stats) {
          if(stats.isFile()) {
            var ext = extname(file);
            var mimetype = helper.getMIMEType(file);
            if(helper.isSupportedMIMEType(mimetype)) {
              let mf = new MediaFile(basename(file), file, mimetype);
              self.files.push(mf);
              // fire events
              // if there is a file that has to be shown instantly do stuff
              if(!firstTriggered && showfile) {
                if(showfile == file) {
                  var idx = self.files.indexOf(mf);
                  self._currentIndex = idx;
                  self.emit("firstFile", {
                    index: idx,
                    mediafile: mf
                  });
                  if(idx > 0) {
                    self.preloadPrevious(idx)
                  }
                  self.preloadNext(idx);

                  firstTriggered = true;
                }
              } else if (self.files.length == 1) {
                self._currentIndex = 0;
                self.emit("firstFile", {
                  index: 0,
                  mediafile: mf
                });
              }

              // always emit a fileAdded!
              self.emit("fileAdded", {
                filecount: self.files.length,
                mediafile: mf
              });

            } else if(helper.isArchive(file)) {
              self.children.push(file);
              self.emit("addedFolder", {
                folder: file,
                isZip: true
              })
            }
          } else if(stats.isDirectory()) {
            self.children.push(file);
            self.emit("addedFolder", {
              folder: file
            })
          }
        })
      })
    })
  }

  viewArchive(archivepath) {
    console.log("viewArchive");
    var self = this;
    var zip = new AdmZip(archivepath);
    var zipEntries = zip.getEntries();
    zipEntries = zipEntries.sort(function(a,b) {
      if(a.entryName < b.entryName) return -1;
      if(a.entryName > b.entryName) return 1;
      return 0;
    })
    this.files = [];
    this.siblings = [];
    zipEntries.forEach(function(file) {
      if(!file.isDirectory) {
        var mimetype = helper.getMIMEType(file.entryName);

        if(helper.isSupportedMIMEType(mimetype)) {
          var fullpath = join(archivepath, file.entryName);
          // pass zipentry instead of buffer, because it's faster (IRC)
          var mf = new MediaFile(file.entryName, fullpath, mimetype, file);
          self.files.push(mf);
          console.log("len: ", self.files.length);
          if(self.files.length == 1) {
            self.emit("firstFile", {
              index: 0,
              filecount: self.files.length,
              mediafile: mf
            });
          }
          self.emit("fileAdded", {
            filecount: self.files.length,
            mediafile: mf
          });
        }
      }
    })
  }

  fetchSiblings() {
    console.log("fetchSiblings");
    var self = this;
    var parentDir = join(this.cwd, "..");
    self.siblings = []
    fsreaddir(parentDir, function(err, files) {
      files = files.map(function(f) {
        return join(parentDir, f);
      })

      files = helper.sortFiles(files);

      files.forEach(function(file) {
        fsstat(file, function(err, stats) {
          if(stats.isDirectory()) {
            self.siblings.push(file);
          } else if (stats.isFile() && helper.isArchive(file)) {
            self.siblings.push(file); // we see zip as normal folders
          }
        })
      })
    })
  }

  current() {
    return this.files[this._currentIndex];
  }

  first() {
    console.log("first");
    this._currentIndex = 0;
    var mf = this.files[this._currentIndex];
    this.emit("currenFileChanged", {
      index: this._currentIndex,
      mediafile: mf
    });
    return mf;
  }

  last() {
    console.log("last");
    this._currentIndex = this.files.length - 1;
    var mf = this.files[this._currentIndex];
    this.emit("currenFileChanged", {
      index: this._currentIndex,
      mediafile: mf
    });
    return mf;
  }

  next() {
    console.log("next");
    if(this._currentIndex + 1 < this.files.length) {
      var mf = this.files[++this._currentIndex];
      this.emit("currenFileChanged", {
        index: this._currentIndex,
        mediafile: mf
      });
      this.preloadNext(this._currentIndex, PRELOADRANGE);
      return mf;
    } else {
      this.emit("folderEnd", {
        isEnd: true
      });
    }
  }

  previous() {
    console.log("previous");
    if(this._currentIndex - 1 >= 0) {
      var mf = this.files[--this._currentIndex];
      this.emit("currenFileChanged", {
        index: this._currentIndex,
        mediafile: mf
      });
      // we're going backwards so maybe preload some stuff
      this.preloadPrevious(this._currentIndex, PRELOADRANGE);
      return mf;
    } else {
      this.emit("folderEnd", {
        isEnd: false  // false because we can't get more "previous"
      });
    }
  }

  preloadNext(idx, range) {
    console.log("preloadNext");
    if(idx + 1 < this.files.length) {
      var mf = this.files[idx + 1];
      var elem = mf.getElement();
      if(range) {
        this.preloadNext(++idx, --range);
      }
      return elem;
    }
  }

  preloadPrevious(idx, range) {
    console.log("preloadPrevious");
    if(idx - 1 >= 0) {
      var mf = this.files[idx - 1];
      console.log("preloading: ", mf.filename);
      var elem = mf.getElement();
      if(range) {
        this.preloadNext(--idx, --range);
      }
      return elem;
    }
  }

  openNextSibling() {
    console.log("openNextSibling");
    var cidx = this.siblings.indexOf(this.cwd);
    console.log(this.cwd);
    console.log(cidx);
    if(cidx + 1 < this.siblings.length) {
      console.log("nextSibling: ", this.siblings[cidx + 1] );
      this.open(this.siblings[cidx + 1])
    }
  }

  openPreviousSibling() {
    var cidx = this.siblings.indexOf(this.cwd);
    console.log("CWD: ", this.cwd);
    console.log("cwd idx: ", cidx);
    if(cidx - 1 >= 0) {
      console.log("previousSibling: ", this.siblings[cidx - 1] );
      this.open(this.siblings[cidx - 1])
    }
  }

  // this will change the cwd
  openFirstChild() {
    if(this.children.length > 0) {
      console.log("openFirstChild: ", this.children[0]);
      this.open(this.children[0])
    } else {
      console.log("no children");
    }
  }

  goUp() {
    console.log("goUp");
    var cwdnew = join(this.cwd, "..");
    this.open(cwdnew);
  }
}
