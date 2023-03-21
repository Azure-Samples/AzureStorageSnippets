import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobParallelUploadOptions,
  ContainerClient,
  ContainerCreateOptions,
  Tags
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import { getBlobTags } from './blob-set-tags';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <Snippet_UploadBlob>
// containerClient: container client
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
// uploadOptions: {
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//    tags: {project: 'xyz', owner: 'accounts-payable'}
//  }
async function createBlobFromString(
  containerClient: ContainerClient,
  blobName,
  fileContentsAsString,
  uploadOptions: BlockBlobParallelUploadOptions
): Promise<void> {
  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  // Upload string
  const uploadResult = await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  if (!uploadResult.errorCode) {
    // do something with blob
    const tags: Tags = await getBlobTags(blockBlobClient);
  }
}
// </Snippet_UploadBlob>

async function main(blobServiceClient): Promise<void> {
  type TList = Promise<void>;
  const blobs: Promise<void>[] = [];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);
  if (containerCreateResponse.errorCode)
    throw Error('container creation failed');
  console.log('container creation succeeded');

  // create 10 blobs with Promise.all
  for (let i = 0; i < 10; i++) {
    // indexed for searching
    // Tags: Record<string, string>
    const tags: Tags = {
      createdBy: 'YOUR-NAME',
      createdWith: `StorageSnippetsForDocs-${i}`,
      createdOn: new Date().toDateString()
    };

    const uploadOptions = {
      // not indexed for searching
      metadata: {
        owner: 'PhillyProject'
      },

      tags
    };

    const pCreateBlob = createBlobFromString(
      containerClient,
      `${containerName}-${i}.txt`,
      `Hello from a string ${i}`,
      uploadOptions
    );

    blobs.push(pCreateBlob);
  }
  await Promise.all<TList>(blobs);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
