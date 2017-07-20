import * as appPackage from '../package.json'
import {remote, shell} from 'electron'

let subtitle = document.getElementById('subtitle')
subtitle.innerText = appPackage.description

let versions = document.getElementById('versions')


let tr, name_td, version_td

tr = document.createElement('tr')
name_td = document.createElement('td')
name_td.innerText = 'meView: '
tr.appendChild(name_td)
version_td = document.createElement('td')
version_td.innerText =  appPackage.version
tr.appendChild(version_td)
tr.appendChild(version_td)
versions.appendChild(tr)


for(let name of ['electron', 'chrome', 'node', 'v8']) {
  let tr = document.createElement('tr')
  let name_td = document.createElement('td')
  name_td.innerText = name +':'
  tr.appendChild(name_td)
  const version_td = document.createElement('td')
  version_td.innerText = process.versions[name]
  tr.appendChild(version_td)
  versions.appendChild(tr)
}

let links = document.getElementsByTagName('a')
console.log(links)
for (let i = 0; i < links.length; i++) {
  links[i].onclick = (e) => {
    console.log(links[i])
    e.preventDefault()
    shell.openExternal(links[i].href)
  }
}

document.onkeyup = (e) => {
  if (e.keyCode === 27) { // 27 = ESC
    remote.getCurrentWindow().close()
  }
}