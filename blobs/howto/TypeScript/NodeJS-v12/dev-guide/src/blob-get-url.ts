// Get container and blob URLs from their client objects.

import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadResponse,
  ContainerClient,
  ContainerCreateResponse
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
dotenv.config();

const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// Connect with secrets to Azure
// const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
// if (!connString) throw Error('Azure Storage Connection string not found');
// const client = BlobServiceClient.fromConnectionString(connString);

// <Snippet_GetUrl>
async function getUrls(blobServiceClient: BlobServiceClient): Promise<void> {
  // create container
  const containerName = `con1-${Date.now()}`;
  const {
    containerClient,
    containerCreateResponse
  }: {
    containerClient: ContainerClient;
    containerCreateResponse: ContainerCreateResponse;
  } = await blobServiceClient.createContainer(containerName, {
    access: 'container'
  });

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  // Display container name and its URL
  console.log(
    `created container:\n\tname=${containerClient.containerName}\n\turl=${containerClient.url}`
  );

  // create blob from string
  const blobName = `${containerName}-from-string.txt`;
  const blobContent = `Hello from a string`;
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
  const blockBlobUploadResponse: BlockBlobUploadResponse =
    await blockBlobClient.upload(blobContent, blobContent.length);

  if (blockBlobUploadResponse.errorCode)
    throw Error(blockBlobUploadResponse.errorCode);

  // Display Blob name and its URL
  console.log(
    `created blob:\n\tname=${blobName}\n\turl=${blockBlobClient.url}`
  );

  // In loops, blob is BlobItem
  // Use BlobItem.name to get BlobClient or BlockBlobClient
  // The get `url` property
  for await (const blob of containerClient.listBlobsFlat({
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: ''
  })) {
    // blob
    console.log('\t', blob.name);

    // Get Blob Client from name, to get the URL
    const tempBlockBlobClient: BlockBlobClient =
      containerClient.getBlockBlobClient(blob.name);

    // Display blob name and URL
    console.log(`\t${blob.name}:\n\t\t${tempBlockBlobClient.url}`);
  }
}
// </Snippet_GetUrl>
getUrls(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
