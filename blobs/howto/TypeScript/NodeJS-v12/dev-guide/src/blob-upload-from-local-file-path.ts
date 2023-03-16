import {
  BlobServiceClient,
  ContainerCreateOptions,
  ContainerClient,
  BlockBlobParallelUploadOptions,
  Tags
} from '@azure/storage-blob';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlob>
// containerName: string
// blobName: string, includes file extension if provided
// localFileWithPath: fully qualified path and file name
// uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }
async function createBlobFromLocalPath(
  containerClient: ContainerClient,
  blobName: string,
  localFileWithPath: string,
  uploadOptions: BlockBlobParallelUploadOptions
): Promise<void> {
  // create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // upload file to blob storage
  await blockBlobClient.uploadFile(localFileWithPath, uploadOptions);
  console.log(`${blobName} succeeded`);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  const blobs: Promise<void>[] = [];

  // create container
  const timestamp = Date.now();
  const containerName = `create-blob-from-local-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };

  const { containerClient } = await blobServiceClient.createContainer(
    containerName,
    containerOptions
  );
  console.log('container creation succeeded');

  // get fully qualified path of file
  // Create file `my-blob` in `./files` directory as this file
  const localFileWithPath = path.join(__dirname, `../files/my-blob`);

  // create 10 blobs with Promise.all
  for (let i = 0; i < 10; i++) {
    // indexed for searching
    // Tags: Record<string, string>
    const tags: Tags = {
      createdBy: 'YOUR-NAME',
      createdWith: `StorageSnippetsForDocs-${i}`,
      createdOn: new Date().toDateString()
    };

    const uploadOptions: BlockBlobParallelUploadOptions = {
      // not indexed for searching
      metadata: {
        owner: 'PhillyProject'
      },

      tags
    };

    blobs.push(
      createBlobFromLocalPath(
        containerClient,
        `${containerName}-${i}.txt`,
        localFileWithPath,
        uploadOptions
      )
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
