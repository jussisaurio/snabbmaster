const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const vstApi = require("./vst-api");
const { getTempFileName } = require("./utils");
const { TEMP_FOLDER_PATH, VST_PLUGIN_ROOT } = require("./constants");

[TEMP_FOLDER_PATH, VST_PLUGIN_ROOT].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const app = express();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, TEMP_FOLDER_PATH);
  },
  filename(req, file, cb) {
    cb(null, getTempFileName("wav"));
  }
});

const upload = multer({ storage });

app.use(cors());

app.post("/upload", upload.single("waveform"), async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file received");
      error.status = 400;
      throw error;
    }

    const { path: uploadedFilePath, mimetype } = req.file;

    if (!mimetype.toLowerCase().includes("audio")) {
      const error = new Error(`Expected audio file, got ${mimetype}`);
      error.status = 400;
      throw error;
    }

    const processed = await vstApi.write({
      tempFile: uploadedFilePath
    });

    res.download(processed, req.file.originalname, async err => {
      if (err) {
        console.log("saatana");
      }

      while (!res.headersSent) {
        await sleep(1000);
      }

      fs.unlink(uploadedFilePath, () => null);
      fs.unlink(processed, () => null);
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
