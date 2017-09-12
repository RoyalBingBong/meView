/**
 * From atom/src/main-process/win-registry.coffee
 */

import {join} from 'path'
import {spawn} from './spawner.js'
import {format} from 'util'

let system32Path, regPath


if(process.env.SystemRoot) {
  system32Path = join(process.env.SystemRoot, 'System32')
  regPath = join(system32Path, 'reg.exe')
} else {
  regPath = 'reg.exe'
}

// Registry keys used for context menu
let fileKeyPath = 'HKCU\\Software\\Classes\\*\\shell\\meView'
let directoryKeyPath = 'HKCU\\Software\\Classes\\directory\\shell\\meView'
let backgroundKeyPath = 'HKCU\\Software\\Classes\\directory\\background\\shell\\meView'
let applicationsKeyPath = 'HKCU\\Software\\Classes\\Applications\\meView.exe'

let execPath = format('"%s"', process.execPath)



function spawnReg(args, callback) {
  spawn(regPath, args, callback)
}

export function installContextMenu(callback) {
  function addToRegistry(args, callback) {
    args.unshift('add')
    args.push('/f')
    spawnReg(args, callback)
  }

  function installFileHandler(callback) {
    let appp = format('%s\\shell\\open\\command', applicationsKeyPath)
    let penarg = format('%s "%1"', execPath)
    args = [appp, '/ve', '/d', penarg]
    addToRegistry(args, callback)
  }

  let args
  function installMenu(keyPath, arg, callback) {
    args = [keyPath, '/ve', '/d', 'Open with meView']
    addToRegistry(args, () => {
      args = [keyPath, '/v', 'Icon', '/d', execPath]
      addToRegistry(args, () => {
        let kp = format('%s\\command', keyPath)
        let pe = format('"%s" "%s"', process.execPath, arg)
        args = [ kp, '/ve', '/d', pe]
        addToRegistry(args, callback)
      })
    })
  }

  installMenu(fileKeyPath, '%1', () => {
    installMenu(directoryKeyPath, '%1', () => {
      installMenu(backgroundKeyPath, '%V', () => {
        installFileHandler(callback)
      })
    })
  })
}

export function uninstallContextMenu(callback) {
  function deleteFromRegistry(keyPath, callback) {
    spawnReg(['delete', keyPath, '/f'], callback)
  }

  deleteFromRegistry(fileKeyPath, () => {
    deleteFromRegistry(directoryKeyPath, () => {
      deleteFromRegistry(backgroundKeyPath, () => {
        deleteFromRegistry(applicationsKeyPath, callback)
      })
    })
  })
}
