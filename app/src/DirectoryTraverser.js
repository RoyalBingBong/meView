import EventEmitter from "events";
import * as path from "path";
import * as fs from "fs";

import * as _ from "lodash";

const defaultOptions = {
  filterDirectories: false,
  filterFiles: false
}

// fileExtension: [".zip"],
// fileSize: {
//   "greaterthan": 500,
//   "smallerthan": 1000
// }

export class DirectoryTraverser  extends EventEmitter {
  constructor(dir, options) {
    super();
    this.cwd = dir;
    this.options = _.merge(defaultOptions, options);
  }

  cd(dir) {
    var self = this;
    var nextdir = path.join(this.cwd, dir);
    var stats = fs.statSync(nextdir);
    var previousPath = path.basename(this.cwd)
    if(stats) {
      // if(stats.isDirectory()) {
      console.log("change dir to: ", nextdir);
      this.cwd = nextdir;
      return previousPath
      // } else if ()
    }
  }

  filterDirectory(filter) {
    var self = this;
    console.log(this.cwd);
    return new Promise(function(resolve, reject) {
      var stats = fs.statSync(self.cwd);

      if(stats.isFile()) {
        return resolve([]);
      }

      console.log("filterDirectory: ", self.cwd);
      var files = fs.readdirSync(self.cwd);
      if(!(files.length > 0)){
        resolve([]);
      }
      var filesStructured = [];
      files.forEach(function(f) {
        var fullname = path.join(self.cwd, f);
        var stats = fs.statSync(fullname);
        var entry;
        if(stats.isFile()) {
          if(filter) {
            if(isFileInFilter(f, filter)) {
              entry = {
                "name": f,
                "fullname": fullname
              }
            } else {
              return;
            }
          } else {
            entry = {
              "name": f,
              "fullname": fullname
            }
          }
        } else if (stats.isDirectory()) {
          entry = {
            "name": f,
            "fullname": fullname,
            "isDirectory": true
          }
        }
        if(entry) {
          filesStructured.push(entry);
        }
      })
      resolve(filesStructured);
    })
  }
}


function isFileInFilter(file, filter) {
  var ext = path.extname(file).replace(".", "");
  console.log("ext: ", ext);
  return (_.indexOf(filter, ext) > -1);
}
