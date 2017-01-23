import * as pkg from '../../package.json'
import * as apppkg from '../package.json'
import {shell} from 'electron'

let subtitle = document.getElementById('subtitle')
subtitle.innerText = apppkg.description

let versions = document.getElementById('versions')

for(let name of ['electron', 'chrome', 'node', 'v8']) {
  let tr = document.createElement('tr')
  let name_td = document.createElement('td')
  name_td.innerText = name
  tr.appendChild(name_td)
  const version_td = document.createElement('td')
  version_td.innerText = ' : ' + process.versions[name]
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
