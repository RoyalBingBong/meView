# In case I forget how I did stuff:

## Files:

### AppMenu.js
Builds the AppMenu and makes calls to the controller.

### controller.js
Has functions to do all the menubar stuff (e.g. open folder) and also keeps an instance of Viewer so I can actually browse images/video.

### Container.js
Parses a directory (or zip) and extracts all the images and video paths. Put them in a list, sort that list and create MediaFiles for each file in the list. Also handles operations for that list: previous, next, first and last. Occasionally emits an event when something changed (e.g. current file count, current viewed file, etc)

### MediaFile.js
Representation of an image or video. Creates HTMLElements for the respective image or video. If the media is in an archive it converts the Buffer the Base64 otherwise it just links the actualy file on the harddrive.

### Viewer.js
Viewer manages the stuff for the UI. E.g. drag and drop, status bar, the actual view for the media files.

### DirectoryTraverser.js
Magically traverses the directory tree when the "Folder Brwoser" window is open.

### other files
The other files should be pretty self-explanatory.

## Use-cases:
### User opens a folder via File -> Open Folder
* AppMenu openfolder entry is clicked and calls `controller.open(true)`
* `open(asFolder)` calls `dialog.showOpenDialog`, which returns the `path`
* The `path` is then passed to `viewer.container.open`
* `viewer.container.open` detect that `path` is a directory and calls `viewDirectory(dir, showfile)`
* `viewDirectory` reads the folder, filters it for images/videos and sorts that list
* We then iterate over the list and create a MediaFile for each file and store it in `this.files`
  * Events are emitted while iterating, e.g. `firstFile`, `fileAdded`, etc.
  * Viewer listens for these events and updates the UI, e.g. current amount of files, current index, etc
    * Upon `firstFile` the Viewer shows the first file.
  * Preloading happens here and there

### User clicks next
* AppMenu entry for next clicked or the shortcut is used
* `controller.viewNext()` is called and in returns calls `viewer.container.next()`
* `viewer.container.next()` changes the current index and emits `currenFileChanged`
* Viewer reacts to `currenFileChanged`, updates the status bar and shows the MediaFile that was appended to the event.