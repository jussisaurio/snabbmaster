const express = require("express");
const cors = require("cors");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");
const { getExtensionForMime, validateMimetype } = require("./utils");

const app = express();
const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const storage = multerS3({
  s3,
  bucket: process.env.AWS_UNPROCESSED_FILES_BUCKET,
  metadata(req, file, cb) {
    cb(null, { originalName: file.originalname });
  },
  key(req, file, cb) {
    cb(null, uuid() + getExtensionForMime(file.mimetype));
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    // Todo check ACTUAL file type using magic numbers
    try {
      validateMimetype(file.mimetype);
      cb(null, true);
    } catch (err) {
      cb(err);
    }
  }
});

app.use(cors(/* TODO BETTER CORS CONF */));

app.post("/upload", upload.single("waveform"), (req, res, next) => {
  const file = req.files ? req.files[0] : req.file;
  res.status(200).send({ ok: true, key: file.key });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.message || "Something went wrong");
});

app.listen(process.env.PORT || 8886, () => console.log("Listening"));
