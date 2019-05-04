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

const ACCEPTED_MIME_TYPES = [
  "audio/x-aiff",
  "audio/x-wav",
  "audio/aiff",
  "audio/wav"
];
const MIME_TO_EXTENSION = {
  "audio/x-aiff": ".aiff",
  "audio/x-wav": ".wav",
  "audio/aiff": ".aiff",
  "audio/wav": ".wav"
};

module.exports = {
  VST_HOST_PATH,
  TEMP_FOLDER_PATH,
  VST_PLUGIN_ROOT,
  ACCEPTED_MIME_TYPES,
  MIME_TO_EXTENSION
};
