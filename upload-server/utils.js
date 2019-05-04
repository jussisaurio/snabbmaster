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
  return `tmp-${identifier.replace(/\s/g, "")}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;
};

const getFileInfo = req => {
  if (!req.file) {
    const error = new Error("No file received");
    error.status = 400;
    throw error;
  }

  return {
    originalFilename: req.file.originalname,
    uploadedFilePath: req.file.path,
    mimeType: req.file.mimetype
  };
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

const loadEnv = (envFilePath = path.resolve(__dirname, ".env")) => {
  const env = fs.readFileSync(envFilePath, "utf8");

  env.split("\n").forEach(row => {
    const [key, value] = row.split("=");
    process.env[key] = value;
  });
};

module.exports = {
  getTempFileName,
  getFileInfo,
  validateMimetype,
  ensureTempFolders,
  loadEnv
};
