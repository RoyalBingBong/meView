/**
 * From the  atom/src/main-process/spawner.coffee
 */
import {spawn as nodeSpawn} from "child_process";
import {format} from "util";

export function spawn(command, args, callback) {
  console.log("spawning: ", command, " with ", args);
  var stdout = "";
  var stderr = "";
  var spawnedProcess;
  try {
    spawnedProcess = nodeSpawn(command, args);
  } catch(err) {
    callback(err, stdout)
  }

  spawnedProcess.stdout.on("data", function(data) {
    stdout += data;
  })
  spawnedProcess.stderr.on("data", function(data) {
    stderr += data;
  })

  var error = null;
  spawnedProcess.on("error", function(processsError) {
    error = error || processsError;
  })
  spawnedProcess.on("close", function(code) {
    if(code != 0) {
      var message = format("Command faile! Exit code %s ", code);
      error = new Error(message);
      error.code = code;
      error.stdout = stdout;
      error.stderr = stderr;
      error.args = args;
    }

    callback(error, stdout);
    spawnedProcess.stdin.end();
  })



}
