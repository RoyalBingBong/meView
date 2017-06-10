import settings from 'electron-settings'
import {supportedMIMETypes} from '../config.json'
import mime from 'mime'


export function errorElement(obj) {
  let errElem = document.createElement('pre')
  errElem.className = 'errorElement'
  errElem.innerHTML = JSON.stringify(obj, null, 2)
  return
}

export function applyVideoSettings(videoelement) {
  let videosettings = settings.getSync('video')
  console.log('videosettings ', videosettings)
  videoelement = applySettings(videoelement, videosettings)
  // disable autoplay so we can preload files that might have auto
  videoelement.autoplay = false
  return videoelement
}

export function applyImageSettings(imageelement) {
  // return applySettings(imageelement, config.imagesettings)
  return imageelement
}

function applySettings(elem, setting) {
  for (let key in setting) {
    elem[key] = setting[key]
  }
  return elem
}

export function applyClass(element, classname) {
  if(!element){
    return
  }
  if(typeof classname === 'string') {
    element.className = classname
  } else {
    element.className = classname.join(' ')
  }
}

export function applyStyle(element) {
  // TODO: do stuff with custom style here
  // element.className = config.defaultStyle
  return element
}

export function isArchive(filepath) {
  // console.log('isArchive: ', filepath, (/\.(zip|cbz)$/i).test(filepath))
  return (/\.(zip|cbz)$/i).test(filepath)
}


/**
 * getMIMEType - Returns the MIMEType for the passed extension
 *
 * @param  {String} ext Extension, eg ".zip" or ".jpeg"
 * @return {String}     MIMEType
 */
export function getMIMEType(file) {
  return mime.lookup(file)
}

export function isSupportedMIMEType(mimetype) {
  console.log()
  return mimetype.startsWith('image') || supportedMIMETypes.indexOf(mimetype) > -1
}

// export function sortFiles(files) {
//   if(process.platform == 'win32') {
//     // TODO: custom sorting
//     return files.sort((a, b) => {
//       a = a.toLowerCase()
//       b = b.toLowerCase()
//       if(a < b) return -1
//       if(a > b) return 1
//       return 0
//     })
//   } else {
//     return files.sort()
//   }
// }

export function sortFiles(files) {
  return files.sort((a, b) => {
    a = a.toLowerCase()
    b = b.toLowerCase()
    if(a < b) return -1
    if(a > b) return 1
    return 0
  })
}


export function isEnvDeveloper() {
  if(process.env.ELECTRON_ENV) {
    let env = process.env.ELECTRON_ENV.trim()
    return (env === 'development' || env === 'dev')
  } else {
    return false
  }
}