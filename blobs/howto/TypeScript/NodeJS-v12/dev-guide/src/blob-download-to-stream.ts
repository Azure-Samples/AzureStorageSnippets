import {
  BlobClient,
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
  ContainerClient,
  ContainerCreateOptions,
  ContainerCreateResponse,
  Tags
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function createBlobFromString(
  containerClient: ContainerClient,
  blobName,
  fileContentsAsString,
  options: BlockBlobUploadOptions
) {
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    options
  );
  console.log(`created blob ${blobName}`);
}
// <snippet_downloadBlobAsStream>
async function downloadBlobAsStream(
  containerClient: ContainerClient,
  blobName,
  writableStream
) {
  const blobClient: BlobClient = await containerClient.getBlobClient(blobName);

  const downloadResponse = await blobClient.download();

  if (!downloadResponse.errorCode && downloadResponse?.readableStreamBody) {
    downloadResponse.readableStreamBody.pipe(writableStream);
    console.log(`download of ${blobName} succeeded`);
  }
}
// </snippet_downloadBlobAsStream>
async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  // create container
  const timestamp = Date.now();
  const containerName = `download-blob-to-string-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  console.log('container creation success');

  // create blob
  const blobTags: Tags = {
    createdBy: 'YOUR-NAME',
    createdWith: `StorageSnippetsForDocs-${timestamp}`,
    createdOn: new Date().toDateString()
  };

  const blobName = `${containerName}-from-string.txt`;
  const blobContent = `Hello from a string`;
  const localFileNameWithPath = path.join(__dirname, blobName);
  const writableStream = fs.createWriteStream(localFileNameWithPath, {
    encoding: 'utf-8',
    autoClose: true
  });

  // create blob from string
  await createBlobFromString(containerClient, blobName, blobContent, {
    tags: blobTags
  });

  // download blob to string
  await downloadBlobAsStream(containerClient, blobName, writableStream);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
