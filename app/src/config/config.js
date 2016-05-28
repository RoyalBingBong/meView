export const defaultVideoSettings = {
    "autoplay": true
  , "loop":     true
  , "muted":    true
}

export const imagesettings = {
  // "className": "fit-to-window"
}

export const defaultStyle = "fit-to-window";

export const defaulSearchPath = (process.platform == "win32" ? "%USERPROFILE%" : "$HOME");

export const supportedMIMEType = [
  "video/ogg",
  "video/webm",
  "video/mp4"
]

export const fileFilter = [
  {name: "Mediafiles", extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webm", "mp4"]},
  {name: 'Archives', extensions: ["zip", "cbz"]},
  {name: 'All Types', extensions: ['*']}
]

export const github = "https://github.com/RoyalBingBong/_derp_"
export const githubIssue = "https://github.com/RoyalBingBong/_derp_/issues"
