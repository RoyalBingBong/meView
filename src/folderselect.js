import {remote} from 'electron'

import {DirectoryTraverser} from './modules/DirectoryTraverser.js'

let currentDir = localStorage.getItem('cwd')

let travis = new DirectoryTraverser(currentDir)

let curDir = document.createElement('option')
curDir.value = '.'
curDir.innerText = '. (Current Directory)'
let parDir = document.createElement('option')
parDir.value = '..'
parDir.innerText = '.. (Parent Directory)'

let selector = document.getElementById('folderselect')


console.log(remote.getCurrentWindow())

selector.ondblclick = (event) => {
  console.log(event.target.file)
  if(event.target.file) {
    console.log('dbl click on: ', event.target.file)
    travis.cd(event.target.file.name)
    updateDir()
  } else {
    if(event.target.value == '..') {
      travis.cd('..')
      updateDir()
    }
    if(event.target.value == '.') {
      updateDir('.')
    }
  }
}

selector.addEventListener('keypress', () => {
  console.log(event)
  let key = event.which
  // pressing 'return'
  if(key == 13) {
    console.log('13')
    let val = selector.options[selector.selectedIndex].value
    updateDir(val)
  }
})

selector.addEventListener('keyup', () => {
  console.log('keyup')
  let key = event.which
  //pressesd "left arrow"
  if(key == 37) {
    updateDir('..')
  }
  // "right arrow"
  if(key == 39) {
    let val = selector.options[selector.selectedIndex].value
    updateDir(val)
  }
})

function updateDir(dir) {
  let prevPath
  if(dir) {
    if(dir == '.') {
      localStorage.setItem('cwd', travis.cwd)
      remote.getCurrentWindow().close()
    } else {
      prevPath = travis.cd(dir)
    }
  }
  travis.filterDirectory(['zip'])
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
    // let i = document.createElement('i')
    // opt.appendChild(i)
    
    opt.value = file.name
    if(file.name == selectitem) {
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
  if (evt.keyCode == 27) {
    remote.getCurrentWindow().destroy()
  }
})


let openButton = document.getElementById('btnOpen')
let cancelButton = document.getElementById('btnCancel')

openButton.addEventListener('click', () => {
  console.log('cancel click')
  let val = selector.options[selector.selectedIndex].value
  console.log(val)
  if(val == '.') {
    // clsoe window and return cwd
    localStorage.setItem('cwd', travis.cwd)
    remote.getCurrentWindow().close()
  } else {
    travis.cd(val)
    updateDir()
  }

})

// close window without new cwd if cancel button is clicked
cancelButton.addEventListener('click', () => {
  console.log('cancel click')  
  remote.getCurrentWindow().destroy()
})


updateDir()
