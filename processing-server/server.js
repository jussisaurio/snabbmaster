const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const vstApi = require("./vst-api");

const { ensureTempFolders, clean, loadEnv } = require("./utils");
const { UNPROCESSED_FILES_PATH } = require("./constants");

loadEnv();

const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const sqs = new AWS.SQS({ region: process.env.AWS_REGION });

ensureTempFolders();

// TODO add SQS polling and basically everything else
const SQS_PARAMS_POLL = {
  QueueUrl: process.env.AWS_SQS_QUEUE_URL,
  MaxNumberOfMessages: 5,
  AttributeNames: ["All"],
  WaitTimeSeconds: 10,
  VisibilityTimeout: 2
};

const getSqsDeleteParams = ReceiptHandle => ({
  QueueUrl: process.env.AWS_SQS_QUEUE_URL,
  ReceiptHandle
});

const { UNPROCESSED_FILES_BUCKET, PROCESSED_FILES_BUCKET } = process.env;

const getS3DownloadParams = Key => ({
  Bucket: UNPROCESSED_FILES_BUCKET,
  Key: clean(Key)
});
const getS3UploadParams = (Key, Body) => ({
  Bucket: PROCESSED_FILES_BUCKET,
  Key: clean(Key),
  Body
});

const queue = [];
async function main() {
  while (true) {
    try {
      const { Messages } = await sqs.receiveMessage(SQS_PARAMS_POLL).promise();
      if (Array.isArray(Messages)) {
        queue.push(...Messages);
      }
    } catch (err) {
      console.log(err);
    }

    while (queue.length) {
      const item = queue.shift();

      let tempFilePath, tempProcessedFilePath;

      const { Attributes, ReceiptHandle, Body } = item;
      try {
        const body = JSON.parse(Body);

        const { s3: s3payload } = body.Records[0];

        const bucketName = s3payload.bucket.name;
        const s3Key = s3payload.object.key;

        if (bucketName !== UNPROCESSED_FILES_BUCKET) {
          throw new Error(
            `Invalid bucket ${bucketName} in unprocessedAudioFileCreated message`
          );
        }

        const params = getS3DownloadParams(s3Key);

        console.log(params);

        tempFilePath = path.resolve(UNPROCESSED_FILES_PATH, s3Key);

        await new Promise((resolve, reject) => {
          const writeStream = fs.createWriteStream(tempFilePath);
          const readStream = s3.getObject(params).createReadStream();

          readStream.pipe(writeStream);

          readStream.on("end", resolve);
          readStream.on("error", reject);
          writeStream.on("error", reject);
        });

        console.log(`Written ${s3Key} to ${tempFilePath}, processing...`);
        tempProcessedFilePath = await vstApi.write({
          tempFilePath,
          name: s3Key
        });
        console.log(
          `Written processed ${s3Key} to ${tempProcessedFilePath}, uploading to s3...`
        );

        await new Promise((resolve, reject) => {
          const fileStream = fs.createReadStream(tempProcessedFilePath);
          fileStream.on("error", reject);
          s3.putObject(getS3UploadParams(s3Key, fileStream))
            .promise()
            .then(resolve)
            .catch(reject);
        });
      } catch (err) {
        console.log(err);
      } finally {
        [tempFilePath, tempProcessedFilePath]
          .filter(Boolean)
          .forEach(filepath => fs.unlink(filepath, console.log));

        await sqs
          .deleteMessage(getSqsDeleteParams(ReceiptHandle))
          .promise()
          .catch(console.log);
      }
    }
  }
}

main();
