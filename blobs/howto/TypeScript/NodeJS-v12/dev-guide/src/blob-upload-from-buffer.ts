import {
  BlobServiceClient,
  ContainerCreateOptions,
  ContainerClient,
  BlockBlobClient,
  BlockBlobParallelUploadOptions,
  BlobGetTagsResponse,
  Tags
} from '@azure/storage-blob';
import { promises as fs } from 'fs';
import path from 'path';
import { getBlobTags } from './blob-set-tags';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlob>
// containerName: string
// blobName: string, includes file extension if provided
// buffer: blob content
// uploadOptions: {
//    blockSize: destination block blob size in bytes,
//    concurrency: concurrency of parallel uploading - must be greater than or equal to 0,
//    maxSingleShotSize: blob size threshold in bytes to start concurrency uploading
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//    tags: {project: 'xyz', owner: 'accounts-payable'}
//  }
async function createBlobFromBuffer(
  containerClient: ContainerClient,
  blobName,
  buffer,
  uploadOptions: BlockBlobParallelUploadOptions
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  // Upload buffer
  await blockBlobClient.uploadData(buffer, uploadOptions);

  // do something with blob
  const tags: Tags = await getBlobTags(blockBlobClient);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient: BlobServiceClient) {
  const blobs: Promise<void>[] = [];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfrombuffer-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };

  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode)
    console.log('container creation failed');

  // get fully qualified path of file
  // Create image file in `./files` directory as this file
  const localFileWithPath = path.join(__dirname, `../files/leaves.jpg`);

  // because no type is passed, open file as buffer
  const buffer: Buffer = await fs.readFile(localFileWithPath);

  // create blobs with Promise.all
  // include the file extension
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
      //  metadata: {[propertyName: string]: string;}
      metadata: {
        owner: 'PhillyProject'
      },

      tags
    };

    blobs.push(
      createBlobFromBuffer(
        containerClient,
        `${containerName}-${i}.jpg`,
        buffer,
        uploadOptions
      )
    );
  }
  await Promise.all(blobs);
}
main(blobServiceClient)
  .then(() => console.log('done'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
