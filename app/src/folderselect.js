import {remote} from 'electron';

import {DirectoryTraverser} from "./DirectoryTraverser.js";


var currentDir = localStorage.getItem("cwd");

var travis = new DirectoryTraverser(currentDir);

var self = this;

var curDir = document.createElement("option");
curDir.value = ".";
curDir.innerText = ". (Current Directory)";
var parDir = document.createElement("option");
parDir.value = "..";
parDir.innerText = ".. (Parent Directory)";



var selector = document.getElementById("folderselect");

selector.ondblclick = function() {
  console.log(event.target.file);
  if(event.target.file) {
    console.log("dbl click on: ", event.target.file);
    travis.cd(event.target.file.name)
    updateDir();
  } else {
    if(event.target.value == "..") {
      travis.cd("..")
      updateDir();
    }
    if(event.target.value == ".") {
      self.nextDir = travis.cwd;
    }
  }
}

selector.addEventListener("keypress", function() {
  console.log(event);
  var key = event.which;
  // pressing 'return'
  if(key == 13) {
    console.log("13");
    var val = selector.options[selector.selectedIndex].value;
    updateDir(val);
  }
})

selector.addEventListener("keyup", function() {
  console.log("keyup");
  var key = event.which;
  //pressesd "left arrow"
  if(key == 37) {
    updateDir("..");
  }
  // "right arrow"
  if(key == 39) {
    var val = selector.options[selector.selectedIndex].value;
    updateDir(val);
  }
})

function updateDir(dir) {
  var prevPath;
  if(dir) {
    if(dir == ".") {
      localStorage.setItem("cwd", travis.cwd);
      remote.getCurrentWindow().close();
    } else {
      prevPath = travis.cd(dir);
    }
  }
  travis.filterDirectory(["zip"])
    .then(function(files) {
      fillSelect(files, prevPath);
    })
}

function fillSelect(files, selectitem) {
  while (selector.firstChild) {
    selector.removeChild(selector.firstChild);
  }

  selector.appendChild(curDir);
  selector.appendChild(parDir);
  var selected = false;
  files.forEach(function(file) {
    var opt = document.createElement("option");
    opt.value = file.name;
    if(file.name == selectitem) {
      selected = true;
      opt.selected = "selected";
    }
    opt.file = file;
    opt.innerText = file.name;
    selector.appendChild(opt);
  })

  if(!selected) {
    curDir.selected = "selected";
  }
}


var openButton = document.getElementById("btnOpen");
var cancelButton = document.getElementById("btnCancel");

openButton.addEventListener("click", function() {
  console.log("cancel click");
  var val = selector.options[selector.selectedIndex].value;
  console.log(val);
  if(val == ".") {
    // clsoe window and return cwd
    localStorage.setItem("cwd", travis.cwd);
    remote.getCurrentWindow().close()
  } else {
    travis.cd(val);
    updateDir();
  }

})


btnCancel.addEventListener("click", function() {
  console.log("cancel click");
  remote.getCurrentWindow().close()
})


updateDir();
