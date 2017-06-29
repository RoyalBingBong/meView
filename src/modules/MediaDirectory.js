import {EventEmitter} from 'events'
import {readdir} from 'fs'

import {recursive} from 'recursive-readdir'

import {supportedMediaTypes} from '../../config.json'

export default class MediaDirectory extends EventEmitter {
  constructor() {
    super()
    this.directory = null
  }

  openDirectory(directory, recursive = false) {
    return new Promise((resolve, reject) => {
      if(this.recursive) {
        this.directory = directory
        recursive(this.directory)
          .then((files) => {
            files = helper.filterFiles(files)
            resolve(files)
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        readdir(this.directory, (err, files) => {
          if(err) {
            reject(err)
          }
          files = helper.filterFiles(files)
          resolve(files)
        })
      }
    })
  }
}


export const helper = {
  filterFiles(files) {
    return files.filter((file) => {
      return supportedMediaTypes.some((ext) => {
        return file.endsWith(ext)
      })
    })
  }
}
