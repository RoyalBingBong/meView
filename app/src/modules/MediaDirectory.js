import { readdir, readFile } from "fs"
import { join, relative, basename } from "path"

import mime from "mime"
import Zip from "node-zip"
import recursive from "recursive-readdir"
import naturalCompare from "natural-compare-lite"

import Locale from "./Locale.js"
import { supportedMediaTypes } from "../../config.json"

export const MediaDirectory = {
  /**
   * Retrieves a list of files in a directory. Walks sub-directories if openrecursive=true.
   * Each file has a name and a path.
   * name is the relative path from 'directory'.
   * path is the full filepath.
   * 
   * @param {any} directory The directory to get the files from
   * @param {boolean} [openrecursive=false] If directory should be crawled recursively
   * @returns {{name: String, path: String}[]} Array of Objects containing name and path
   * @memberof MediaDirectory
   */
  openDirectory(directory, openrecursive = false) {
    return new Promise((resolve, reject) => {
      let list = []
      if (openrecursive) {
        recursive(directory)
          .then((files) => {
            files = helper.filterFiles(files)
            files.forEach((file) => {
              if (helper.supportedFileFormat(file)) {
                let mimetype = mime.lookup(file)
                list.push({
                  name: relative(directory, file),
                  path: file,
                  mimetype
                })
              }
            })
            // if (list.length === 0) {
            //   reject(
            //     new Error(Locale.__("errors.nomediafiles", basename(directory)))
            //   )
            // }
            resolve(MediaDirectory.sort(list))
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        readdir(directory, (err, files) => {
          if (err) {
            reject(err)
          }
          files = helper.filterFiles(files)
          files.forEach((file) => {
            if (helper.supportedFileFormat(file)) {
              let mimetype = mime.lookup(file)
              list.push({
                name: file,
                path: join(directory, file),
                mimetype
              })
            }
          })
          // if (list.length === 0) {
          //   reject(
          //     new Error(Locale.__("errors.nomediafiles", basename(directory)))
          //   )
          // }
          resolve(MediaDirectory.sort(list))
        })
      }
    })
  },
  
  openSet(files) {
    return new Promise((resolve, reject) => {
      let list = []
      files.forEach((file) => {
        if(helper.supportedFileFormat(file)) {
          let mimetype = mime.lookup(file);
          list.push({
            name: basename(file),
            path: file,
            mimetype
          })
        }
      })
      // if (list.length === 0) {
      //   reject(
      //     new Error(Locale.__("errors.nomediafilesinset"))
      //   )
      // }
      resolve(MediaDirectory.sort(list));
    })
  },

  /**
   * Opens a zip-file and return a list of files. Each file has a name and a path.
   * name is the relative to the zipfile.
   * path is the data of the file as base64-string, including mimetype
   * 
   * @param {any} zipfile 
   * @returns {{name: String, path: String}[]} Array of objects containing name and path
   * @memberof MediaDirectory
   */
  openZip(zipfile) {
    return new Promise((resolve, reject) => {
      let list = []
      readFile(zipfile, (err, fd) => {
        if (err) {
          reject(err)
        }
        let unzipper = new Zip(fd)
        for (let file in unzipper.files) {
          if (helper.supportedFileFormat(file)) {
            let mimetype = mime.lookup(file)
            let buf = Buffer.from(unzipper.files[file]._data.getContent())
            list.push({
              name: file,
              path: `data:${mimetype};base64, ${buf.toString("base64")}`,
              mimetype
            })
          }
        }
        if (list.length === 0) {
          reject(new Error(Locale.__("errors.nomediafiles", basename(zipfile))))
        }
        resolve(MediaDirectory.sort(list))
      })
    })
  },

  /**
   * Windows style sorting of a list
   * 
   * ['foo 1', 'foo 12', 'foo 3'] becomes ['foo 1', 'foo 3', 'foo 12']
   * 
   * @param {{name: String, path: String}[]} list List to sort
   * @returns {{name: String, path: String}[]} Sorted file-list
   * @memberof MediaDirectory
   */
  sort(list) {
    return list.sort((a, b) => {
      return naturalCompare(a.name.toLowerCase(), b.name.toLowerCase())
    })
  }
}

export const helper = {
  filterFiles(files) {
    return files.filter((file) => {
      return supportedMediaTypes.some((ext) => {
        return file.toLowerCase().endsWith(ext)
      })
    })
  },
  supportedFileFormat(file) {
    return supportedMediaTypes.some((ext) => {
      return file.toLowerCase().endsWith(ext)
    })
  }
}
