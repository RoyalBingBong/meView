export default class Viewport {

  constructor() {
    this.viewport = document.getElementById('autoheight')
    this.dropzonecontainer = document.getElementById('dropzonecontainer')
    this.main = document.getElementById('mainview')
    this.body = document.body
  }

  fullheight(full) {
    if(full) {
      console.log('full height')
      this.viewport.classList.add('notoolbar')
      this.dropzonecontainer.classList.add('notoolbar')
    } else {
      console.log('height minus toolbar')
      this.viewport.classList.remove('notoolbar')
      this.dropzonecontainer.classList.remove('notoolbar')
    }
  }

  videoUI(enabled) {
    if(enabled) {
      this.main.classList.remove('novideoui')
    } else {
      this.main.classList.add('novideoui')
    }
  }

  mouseCursor(enabled) {
    if(enabled) {
      document.body.style.cursor = 'default'
    } else {
      document.body.style.cursor = 'none'
    }
  }

}