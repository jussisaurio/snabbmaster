const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const {
  VST_HOST_PATH,
  VST_PLUGIN_ROOT,
  PROCESSED_FILES_PATH
} = require("./constants");

function write({ tempFilePath, name }) {
  return new Promise((resolve, reject) => {
    const onFailure = (err, final) => {
      typeof final === "string" && fs.unlink(final, () => null);
      reject(err);
    };
    try {
      const outputFilePath = path.resolve(PROCESSED_FILES_PATH, name);

      const vstCommand = spawn(
        VST_HOST_PATH,
        `--plugin-root ${VST_PLUGIN_ROOT} --input ${tempFilePath} --output ${outputFilePath} --plugin mrs_limiter`.split(
          " "
        )
      );

      vstCommand.on("data", console.log);
      vstCommand.on("error", err => onFailure(err, outputFilePath));
      vstCommand.on("close", (code, signal) => {
        console.log(code, signal);
        if (code > 0) {
          const err = new Error("Something went wrong.");
          err.status = 500;
          return onFailure(err, outputFilePath);
        }

        resolve(outputFilePath);
      });
    } catch (err) {
      onFailure(err);
    }
  });
}

module.exports = {
  write
};
