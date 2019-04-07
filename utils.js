const fs = require("fs");
const {
  MIME_TO_EXTENSION,
  TEMP_FOLDER_PATH,
  VST_PLUGIN_ROOT,
  ACCEPTED_MIME_TYPES
} = require("./constants");

const getExtensionForMime = mime => MIME_TO_EXTENSION[mime] || "unknown";

const getTempFileName = (originalName, mime) => {
  const parts = originalName.split(".");
  const { length } = parts;

  let identifier, extension;
  if (length === 1) {
    identifier = parts[0];
    extension = getExtensionForMime(mime);
  } else {
    extension = parts.pop();
    identifier = parts.join(".");
  }
  return `tmp-${identifier}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;
};

const getFileInfo = req => {
  if (!req.file) {
    const error = new Error("No file received");
    error.status = 400;
    throw error;
  }

  const info = {
    originalFilename: req.file.originalname,
    uploadedFilePath: req.file.path,
    mimeType: req.file.mimetype
  };
  console.log(info);
  return info;
};

const validateMimetype = mime => {
  if (
    !ACCEPTED_MIME_TYPES.some(accepted =>
      mime.toLowerCase().startsWith(accepted)
    )
  ) {
    const error = new Error(
      `Expected one of: ${ACCEPTED_MIME_TYPES.join(", ")}, got ${mime}`
    );
    error.status = 400;
    throw error;
  }
};

const ensureTempFolders = () =>
  [TEMP_FOLDER_PATH, VST_PLUGIN_ROOT].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
  getTempFileName,
  getFileInfo,
  validateMimetype,
  ensureTempFolders,
  sleep
};
