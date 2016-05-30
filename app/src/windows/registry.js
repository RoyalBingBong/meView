/**
 * From atom/src/main-process/win-registry.coffee
 */

import {join} from "path";
import {spawn} from "./spawner.js";
import {format} from "util";
var system32Path, regPath;


if(process.env.SystemRoot) {
  system32Path = join(process.env.SystemRoot, 'System32')
  regPath = join(system32Path, 'reg.exe')
} else {
  regPath = 'reg.exe';
}

// Registry keys used for context menu
var fileKeyPath = 'HKCU\\Software\\Classes\\*\\shell\\meView'
var directoryKeyPath = 'HKCU\\Software\\Classes\\directory\\shell\\meView'
var backgroundKeyPath = 'HKCU\\Software\\Classes\\directory\\background\\shell\\meView'
var applicationsKeyPath = 'HKCU\\Software\\Classes\\Applications\\meView.exe'

var execPath = format("\"%s\"", process.execPath);



function spawnReg(args, callback) {
  console.log(regPath);
  console.log(args);
  spawn(regPath, args, callback);
}

export function installContextMenu(callback) {
  function addToRegistry(args, callback) {
    args.unshift('add')
    args.push('/f')
    spawnReg(args, callback);
  }

  function installFileHandler(callback) {
    var appp = format("%s\\shell\\open\\command", applicationsKeyPath)
    var penarg = format("%s \"%1\"", execPath)
    args = [appp, '/ve', '/d', penarg]
    addToRegistry(args, callback)
  }

  var args;
  function installMenu(keyPath, arg, callback) {
    args = [keyPath, "/ve", "/d", "Open with meView"];
    addToRegistry(args, function() {
      args = [keyPath, '/v', 'Icon', '/d', execPath]
      addToRegistry(args, function() {
        var kp = format("%s\\command", keyPath)
        var pe = format("\"%s\" \"%s\"", process.execPath, arg)
        args = [ kp, '/ve', '/d', pe];
        addToRegistry(args, callback);
      })
    })
  }

  installMenu(fileKeyPath, "%1", function() {
    installMenu(directoryKeyPath, "%1", function() {
      installMenu(backgroundKeyPath, "%V", function() {
        installFileHandler(callback);
      })
    })
  })
}

export function uninstallContextMenu(callback) {
  function deleteFromRegistry(keyPath, callback) {
    spawnReg(['delete', keyPath, '/f'], callback)
  }

  deleteFromRegistry(fileKeyPath, function() {
    deleteFromRegistry(directoryKeyPath, function() {
      deleteFromRegistry(backgroundKeyPath, function() {
        deleteFromRegistry(applicationsKeyPath, callback)
      })
    })
  })
}
