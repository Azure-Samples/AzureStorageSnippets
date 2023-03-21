import {
  AppendBlobCreateIfNotExistsOptions,
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function appendToBlob(containerClient: ContainerClient, timestamp) {
  // name of blob
  const blobName = `append-blob-transform-${timestamp}`;

  // add metadata to blob
  const options: AppendBlobCreateIfNotExistsOptions = {
    metadata: {
      owner: 'YOUR-NAME',
      project: 'append-blob-sample'
    }
  };

  // get appendBlob client
  const appendBlobClient = containerClient.getAppendBlobClient(blobName);

  // create blob to save logs
  const createAppendBlobResult = await appendBlobClient.createIfNotExists(
    options
  );

  if (createAppendBlobResult.errorCode)
    throw Error(createAppendBlobResult.errorCode);

  console.log(`Created appendBlob ${blobName} ${createAppendBlobResult.date}`);

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
  const appendBlockResult = await appendBlobClient.appendBlock(
    contents,
    contents.length
  );

  if (appendBlockResult.errorCode) throw Error(appendBlockResult.errorCode);
  console.log(`appendBlock finished ${appendBlockResult.lastModified}`);

  // add more iterations of appendBlob to continue adding
  // to same blob
  // ...await appendBlobClient.appendBlock(contents, contents.length);

  // when done, seal a day's log to read-only
  // doesn't work on hierarchical namespace account
  const sealResult = await appendBlobClient.seal({});
  if (sealResult.errorCode) throw Error(sealResult.errorCode);

  console.log(
    `Sealed appendBlob ${blobName} ${sealResult.blobCommittedBlockCount}`
  );
}

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  // create container
  const timestamp = Date.now();
  const containerName = `append-blob-from-log-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
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
