import {remote, shell} from 'electron'

import * as appPackage from '../../package.json'


export default class About {
  constructor() {
    this.about = document.getElementById('aboutcontainer')
    this.initClickHandler()
    this.initVersionTable()
    this.initLinks()
  }

  get visible() {
    return !this.about.classList.contains('hidden')
  }

  show() {
    this.about.classList.remove('hidden')
  }

  hide() {
    this.about.classList.add('hidden')
  }

  initClickHandler() {
    this.about.onclick = (e) => {
      this.hide()
    }
  }

  initVersionTable() {
    for(let key in process.versions) {
      let cell = document.querySelector(`#about #${key}`)
      if(cell) {
        cell.innerText = 'v'+ process.versions[key]
      }
    }
    let appVersion = document.querySelector('#about #app')
    appVersion.innerText = 'v'+ appPackage.version
  }

  initLinks() {
    let links = document.querySelectorAll('#about a')
    links.forEach((link) => {
      link.onclick = (e) => {
        e.preventDefault()
        shell.openExternal(link.href)
      }
    })
  }
}