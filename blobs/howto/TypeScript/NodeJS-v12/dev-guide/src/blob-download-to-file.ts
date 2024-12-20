import {
  BlobClient,
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

// <snippet_downloadBlobToFile>
async function downloadBlobToFile(
  containerClient: ContainerClient,
  blobName: string,
  filePath: string
): Promise<void> {

  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.downloadToFile(filePath);
}
// </snippet_downloadBlobToFile>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient('sample-container');
  const blobName = 'sample-blob.txt';
  const filePath = path.join('path/to/file', 'fileName.txt');

  // download blob to string
  await downloadBlobToFile(containerClient, blobName, filePath);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
