/**
 * From the  atom/src/main-process/spawner.coffee
 */
import {spawn as nodeSpawn} from 'child_process'
import {format} from 'util'

export function spawn(command, args, callback) {
  console.log('spawning: ', command, ' with ', args)
  let stdout = ''
  let stderr = ''
  let spawnedProcess
  try {
    spawnedProcess = nodeSpawn(command, args)
  } catch(err) {
    callback(err, stdout)
  }

  spawnedProcess.stdout.on('data', (data) => {
    stdout += data
  })
  spawnedProcess.stderr.on('data', (data) => {
    stderr += data
  })

  let error = null
  spawnedProcess.on('error', (processsError) => {
    error = error || processsError
  })
  spawnedProcess.on('close', (code) => {
    if(code !== 0) {
      let message = format('Command faile! Exit code %s ', code)
      error = new Error(message)
      error.code = code
      error.stdout = stdout
      error.stderr = stderr
      error.args = args
    }

    callback(error, stdout)
    spawnedProcess.stdin.end()
  })
}
