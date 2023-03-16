import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function appendToBlob(containerClient, timestamp) {
  // name of blob
  const blobName = `append-blob-transform-${timestamp}`;

  // add metadata to blob
  const options = {
    metadata: {
      owner: 'YOUR-NAME',
      project: 'append-blob-sample'
    }
  };

  // get appendBlob client
  const appendBlobClient = containerClient.getAppendBlobClient(blobName);

  // create blob to save logs
  await appendBlobClient.createIfNotExists(options);
  console.log(`Created appendBlob ${blobName}`);

  // fetch log as stream
  // get fully qualified path of file
  // Create file `my-local-file.txt` in `./files` directory as this file
  const localFileWithPath = path.join(__dirname, `../files/my-local-file.txt`);
  console.log(`localFileWithPath ${localFileWithPath}`);

  // read file
  const contents = await fs.readFile(localFileWithPath, 'utf8');
  console.log(`contents ${contents}`);

  // send content to appendBlob
  // such as a log file on hourly basis
  await appendBlobClient.appendBlock(contents, contents.length);
  console.log(`appendBlock finished`);

  // add more iterations of appendBlob to continue adding
  // to same blob
  // ...await appendBlobClient.appendBlock(contents, contents.length);

  // when done, seal a day's log to read-only
  // doesn't work on hierarchical namespace account
  await appendBlobClient.seal({});
  console.log(`Sealed appendBlob ${blobName}`);
}

async function main(blobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `append-blob-from-log-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };

  // create a container
  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );

  await appendToBlob(containerClient, timestamp);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
