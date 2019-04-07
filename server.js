const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const vstApi = require("./vst-api");
const {
  getTempFileName,
  getFileInfo,
  validateMimetype,
  ensureTempFolders,
  sleep
} = require("./utils");
const { TEMP_FOLDER_PATH } = require("./constants");

const app = express();
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, TEMP_FOLDER_PATH);
  },
  filename(req, file, cb) {
    cb(null, getTempFileName(file.originalname, file.mimetype));
  }
});
const upload = multer({ storage });

app.use(cors());

app.post("/upload", upload.single("waveform"), async (req, res, next) => {
  try {
    const { originalFilename, uploadedFilePath, mimeType } = getFileInfo(req);

    validateMimetype(mimeType);

    const processedFilePath = await vstApi.write({
      tempFile: uploadedFilePath,
      mimeType
    });

    res.download(processedFilePath, originalFilename, async err => {
      if (err) {
        console.log("saatana");
      }

      while (!res.headersSent) {
        await sleep(1000);
      }

      fs.unlink(uploadedFilePath, () => null);
      fs.unlink(processedFilePath, () => null);
    });
  } catch (err) {
    if (req.file && req.file.originalname) {
      fs.unlink(req.file.originalname, () => null);
    }
    return next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.message || "Something went wrong");
});

app.listen(process.env.PORT || 8886, () => console.log("Listening"));

ensureTempFolders();
