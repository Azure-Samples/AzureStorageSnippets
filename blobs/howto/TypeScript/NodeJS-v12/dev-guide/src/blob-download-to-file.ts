import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
  ContainerClient,
  ContainerCreateOptions,
  Tags
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
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
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    options
  );
  console.log(`created blob ${blobName}`);
}

// <snippet_downloadBlobToFile>
async function downloadBlobToFile(containerClient, blobName, fileNameWithPath) {
  const blobClient: BlockBlobClient = await containerClient.getBlobClient(
    blobName
  );

  await blobClient.downloadToFile(fileNameWithPath);
  console.log(`download of ${blobName} success`);
}
// </snippet_downloadBlobToFile>

async function main(blobServiceClient: BlobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `download-blob-to-file-${timestamp}`;
  console.log(`creating container ${containerName}`);
  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );

  console.log('container creation success');

  // create blob
  const blobTags: Tags = {
    createdBy: 'YOUR-NAME',
    createdWith: `StorageSnippetsForDocs-${timestamp}`,
    createdOn: new Date().toDateString()
  };

  const blobName = `${containerName}-from-string.txt`;
  const blobContent = `Hello from a string`;
  const newFileNameAndPath = path.join(
    __dirname,
    `${containerName}-downloaded-to-file.txt`
  );

  // create blob from string
  await createBlobFromString(containerClient, blobName, blobContent, {
    tags: blobTags
  });

  // download blob to string
  await downloadBlobToFile(containerClient, blobName, newFileNameAndPath);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
