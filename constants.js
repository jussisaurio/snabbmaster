const path = require("path");
const { platform } = process;

const VST_HOST_PATH = path.resolve(
  __dirname,
  "binary/mrswatson",
  platform,
  platform === "darwin" ? "mrswatson" : "mrswatson64" // use different executable for osx/linux
);

const VST_PLUGIN_ROOT = path.resolve(__dirname, "vst");
const TEMP_FOLDER_PATH = path.resolve(__dirname, "tmp");

module.exports = {
  VST_HOST_PATH,
  TEMP_FOLDER_PATH,
  VST_PLUGIN_ROOT
};
