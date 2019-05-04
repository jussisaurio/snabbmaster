const fs = require("fs");
const path = require("path");
const {
  TEMP_FOLDER_PATH,
  UNPROCESSED_FILES_PATH,
  PROCESSED_FILES_PATH,
  VST_PLUGIN_ROOT
} = require("./constants");

const clean = key => key.replace(/\+/g, " "); // S3 converts spaces to plus signs and then doesnt accept them back

const ensureTempFolders = () =>
  [
    TEMP_FOLDER_PATH,
    UNPROCESSED_FILES_PATH,
    PROCESSED_FILES_PATH,
    VST_PLUGIN_ROOT
  ].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

const loadEnv = (envFilePath = path.resolve(__dirname, ".env")) => {
  const env = fs.readFileSync(envFilePath, "utf8");

  env.split("\n").forEach(row => {
    const [key, value] = row.split("=");
    process.env[key] = value;
  });
};

module.exports = {
  clean,
  ensureTempFolders,
  loadEnv
};
