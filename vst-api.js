const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const {
  VST_HOST_PATH,
  VST_PLUGIN_ROOT,
  TEMP_FOLDER_PATH
} = require("./constants");
const { getTempFileName } = require("./utils");

function write({ tempFile, mimeType }) {
  return new Promise((resolve, reject) => {
    const onFailure = (err, temp, final) => {
      typeof temp === "string" && fs.unlink(temp, () => null);
      typeof final === "string" && fs.unlink(final, () => null);
      reject(err);
    };
    try {
      const outputFilePath = path.resolve(
        TEMP_FOLDER_PATH,
        getTempFileName("processed", mimeType)
      );

      const vstCommand = spawn(
        VST_HOST_PATH,
        `--plugin-root ${VST_PLUGIN_ROOT} --input ${tempFile} --output ${outputFilePath} --plugin mrs_limiter`.split(
          " "
        )
      );

      vstCommand.on("data", console.log);
      vstCommand.on("error", err => onFailure(err, tempFile, outputFilePath));
      vstCommand.on("close", (code, signal) => {
        console.log(code, signal);
        if (code > 0) {
          const err = new Error("Something went wrong.");
          err.status = 500;
          return onFailure(err, tempFile, outputFilePath);
        }

        resolve(outputFilePath);
      });
    } catch (err) {
      onFailure(err, tempFile);
    }
  });
}

module.exports = {
  write
};
