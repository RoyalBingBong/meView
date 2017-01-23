import EventEmitter from 'events'
import * as path from 'path'
import * as fs from 'fs'

import * as _ from 'lodash'

const defaultOptions = {
  filterDirectories: false,
  filterFiles: false
}

// fileExtension: [".zip"],
// fileSize: {
//   "greaterthan": 500,
//   "smallerthan": 1000
// }

/**
 * Class to easily traverse a directory tree. Used in the app's folder 
 * browser that appears when the user reached the end of a directory.
 * 
 * @export
 * @class DirectoryTraverser
 * @extends {EventEmitter}
 */
export class DirectoryTraverser  extends EventEmitter {
  constructor(dir, options) {
    super()
    this.cwd = dir
    this.options = _.merge(defaultOptions, options)
  }

  /**
   * Change directory
   * 
   * @param {string} dir Target dirctory
   * @returns
   * 
   * @memberOf DirectoryTraverser
   */
  cd(dir) {
    let nextdir = path.join(this.cwd, dir)
    let stats = fs.statSync(nextdir)
    let previousPath = path.basename(this.cwd)
    if(stats) {
      // if(stats.isDirectory()) {
      console.log('change dir to: ', nextdir)
      this.cwd = nextdir
      return previousPath
      // } else if ()
    }
  }

  /**
   * Filters the contents of the current directory according to the passed filter.
   * E.g. filter=['.zip'] will treat zip-files as folders
   * 
   * @param {string[]} filter List of file extension that 
   * @returns {Promise}
   * 
   * @memberOf DirectoryTraverser
   */
  filterDirectory(filter) {
    console.log(this.cwd)
    return new Promise((resolve, reject) => {
      fs.stat(this.cwd, (err, stats) => {
        if(err) {
          reject(err)
        } else {
          if(stats.isFile()) {
            return resolve([])
          }
        }
      })

      console.log('filterDirectory: ', this.cwd)

      fs.readdir(this.cwd, (err, files) => {
        if(err || !(files.length > 0)){
          resolve([])
        } else {
          let filesStructured = []
          files.forEach((f) => {
            let fullname = path.join(this.cwd, f)
            let stats
            // fs.stat on system files deos not work, lets be gracious about it
            try {
              stats = fs.statSync(fullname)
            } catch(err) {
              console.error(err)
              return      
            }
            let entry
            if(stats.isFile()) {
              if(filter) {
                if(isFileInFilter(f, filter)) {
                  entry = {
                    'name': f,
                    'fullname': fullname
                  }
                } else {
                  return
                }
              } else {
                entry = {
                  'name': f,
                  'fullname': fullname
                }
              }
            } else if (stats.isDirectory()) {
              entry = {
                'name': f,
                'fullname': fullname,
                'isDirectory': true
              }
            }
            if(entry) {
              filesStructured.push(entry)
            }
          })
          resolve(filesStructured)
        }
      })
    })
  }
}


function isFileInFilter(file, filter) {
  let ext = path.extname(file).replace('.', '')
  return (_.indexOf(filter, ext) > -1)
}
