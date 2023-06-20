import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobParallelUploadOptions,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlobIndexTags>
async function uploadBlobWithIndexTags(
  containerClient: ContainerClient,
  blobName: string,
  localFilePath: string
): Promise<void> {
  // Specify index tags for blob
  const uploadOptions: BlockBlobParallelUploadOptions = {
    tags: {
      'Sealed': 'false',
      'Content': 'image',
      'Date': '2023-06-01',
    }
  };

  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
// </Snippet_UploadBlobIndexTags>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  uploadBlobWithIndexTags(containerClient, `sample-blob.txt`, localFilePath)
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
