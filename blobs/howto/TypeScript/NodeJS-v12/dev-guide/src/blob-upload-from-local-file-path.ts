import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlob>
async function uploadBlobFromLocalPath(
  containerClient: ContainerClient,
  blobName: string,
  localFilePath: string
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(localFilePath);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const blobs: Promise<void>[] = [];

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // create 10 blobs with Promise.all
  for (let i = 0; i < 10; i++) {
    blobs.push(
      uploadBlobFromLocalPath(containerClient, `sample${i}.txt`, localFilePath)
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
