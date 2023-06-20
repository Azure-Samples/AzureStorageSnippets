import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlob>
async function uploadBlobFromString(
  containerClient: ContainerClient,
  blobName: string,
  fileContents: string
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(fileContents, fileContents.length);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient): Promise<void> {
  const containerClient: ContainerClient = blobServiceClient.getContainerClient('sample-container');

  uploadBlobFromString(containerClient, 'sample-blob.txt', 'Hello string!');
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
