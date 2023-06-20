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

// <Snippet_UploadBlobTransferOptions>
async function uploadWithTransferOptions(
  containerClient: ContainerClient,
  blobName: string,
  localFilePath: string
): Promise<void> {
  // Specify data transfer options
  const uploadOptions: BlockBlobParallelUploadOptions = {
    blockSize: 4 * 1024 * 1024, // 4 MiB max block size
    concurrency: 2, // maximum number of parallel transfer workers
    maxSingleShotSize: 8 * 1024 * 1024, // 8 MiB initial transfer size
  };

  // Create blob client from container client
  const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
// </Snippet_UploadBlobTransferOptions>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  uploadWithTransferOptions(containerClient, `sample-blob.txt`, localFilePath)
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
