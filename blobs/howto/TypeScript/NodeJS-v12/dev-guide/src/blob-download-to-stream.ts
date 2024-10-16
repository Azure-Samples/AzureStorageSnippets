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

// <snippet_downloadBlobAsStream>
async function downloadBlobAsStream(
  containerClient: ContainerClient,
  blobName: string,
  writableStream: fs.WriteStream
) {
  const blobClient: BlobClient = await containerClient.getBlobClient(blobName);

  const downloadResponse = await blobClient.download();

  if (!downloadResponse.errorCode && downloadResponse?.readableStreamBody) {
    downloadResponse.readableStreamBody.pipe(writableStream);
  }
}
// </snippet_downloadBlobAsStream>
async function main(blobServiceClient: BlobServiceClient): Promise<void> {

  const containerClient = blobServiceClient.getContainerClient('sample-container');
  const blobName = 'sample-blob.txt';
  const filePath = path.join('filePath', 'fileName.txt');
  const writableStream = fs.createWriteStream(filePath, {
    encoding: 'utf-8',
    autoClose: true
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
