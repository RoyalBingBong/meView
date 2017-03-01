import {remote, ipcRenderer} from 'electron'

import {DirectoryTraverser} from './modules/DirectoryTraverser.js'

import {supportedArchivesFormats} from '../config.json'

let travis
const curDir = document.createElement('option')
curDir.value = '.'
curDir.innerText = '. (Current Directory)'
const parDir = document.createElement('option')
parDir.value = '..'
parDir.innerText = '.. (Parent Directory)'

const selector = document.getElementById('folderselect')
const cwdText = document.getElementById('cwd')

ipcRenderer.on('cwd', (event, cwd) => {
  travis = new DirectoryTraverser(cwd)
  cwdText.value = cwd
  updateDir()
})

function open(path) {
  ipcRenderer.send('folderBrowser', path) // sendSync will block destroy()
  remote.getCurrentWindow().destroy()
}

selector.ondblclick = (event) => {
  console.log(event.target.file)
  if(event.target.file) {

    supportedArchivesFormats.forEach((ext) => {
      if(event.target.file.name.endsWith(ext)) {
        travis.cd(event.target.file.name)
        open(travis.cwd)
      }
    })

    console.log('dbl click on: ', event.target.file)
    travis.cd(event.target.file.name)
    updateDir()
  } else {
    if(event.target.value === '..') {
      travis.cd('..')
      updateDir()
    } else if(event.target.value === '.') {
      updateDir('.')
    }
  }
}

selector.addEventListener('keypress', () => {
  console.log(event)
  let key = event.which
  // pressing 'return'
  if(key === 13) {
    console.log('13')
    let val = selector.options[selector.selectedIndex].value
    updateDir(val)
  }
})

selector.addEventListener('keyup', () => {
  console.log('keyup')
  let key = event.which
  //pressesd "left arrow"
  if(key === 37) {
    updateDir('..')
  }
  // "right arrow"
  if(key === 39) {
    let val = selector.options[selector.selectedIndex].value
    updateDir(val)
  }
})

function updateDir(dir) {
  let prevPath
  if(dir) {
    if(dir === '.') {
      open(travis.cwd)
    } else {
      prevPath = travis.cd(dir)
      cwdText.value = travis.cwd
    }
  }
  travis.filterDirectory(supportedArchivesFormats)
    .then((files) => {
      fillSelect(files, prevPath)
    })
    .catch((err) => {
      console.log('filterDirectory', err)
    })
}

function fillSelect(files, selectitem) {
  while (selector.firstChild) {
    selector.removeChild(selector.firstChild)
  }

  selector.appendChild(curDir)
  selector.appendChild(parDir)
  let selected = false
  files.forEach((file) => {
    let opt = document.createElement('option')
   
    opt.value = file.name
    if(file.name === selectitem) {
      selected = true
      opt.selected = 'selected'
    }
    opt.file = file
    opt.innerText = file.name
    selector.appendChild(opt)
  })

  if(!selected) {
    curDir.selected = 'selected'
  }
}

// close window without chaning cwd, if ESC key was pressed
document.addEventListener('keyup', (evt) => {
  evt = evt || window.event
  if (evt.keyCode === 27) { // 27 = ESC
    remote.getCurrentWindow().destroy()
  }
})


const openButton = document.getElementById('btnOpen')
const cancelButton = document.getElementById('btnCancel')

openButton.addEventListener('click', () => {
  console.log('open click')
  let val = selector.options[selector.selectedIndex].value
  console.log(val)
  travis.cd(val)
  if(val === '..') {    
    updateDir()
  } else {
    open(travis.cwd)
  }
})

// close window without new cwd if cancel button is clicked
cancelButton.addEventListener('click', () => {
  console.log('cancel click')  
  remote.getCurrentWindow().destroy()
})