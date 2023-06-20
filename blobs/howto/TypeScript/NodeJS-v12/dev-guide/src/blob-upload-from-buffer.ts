import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { getBlobTags } from './blob-set-tags';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlob>
async function uploadBlobFromBuffer(
  containerClient: ContainerClient, blobName: string, buffer: Buffer
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload buffer
  await blockBlobClient.uploadData(buffer);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient: BlobServiceClient) {
  const blobs: Promise<void>[] = [];

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath: string = path.join('file-path', 'sample-blob.txt');

  // because no type is passed, open file as buffer
  const buffer: Buffer = await fs.readFile(localFilePath);

  // create blobs with Promise.all
  // include the file extension
  for (let i = 0; i < 10; i++) {
    blobs.push(
      uploadBlobFromBuffer(containerClient,`sample-${i}.txt`,buffer)
    );
  }
  await Promise.all(blobs);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
