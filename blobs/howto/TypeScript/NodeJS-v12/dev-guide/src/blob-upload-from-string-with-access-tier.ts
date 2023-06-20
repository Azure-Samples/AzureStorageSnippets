import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
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

//<Snippet_UploadAccessTier>
async function uploadWithAccessTier(
  containerClient: ContainerClient
): Promise<BlockBlobClient> {
  // Create blob
  const timestamp = Date.now();
  const blobName = `myblob-${timestamp}`;
  console.log(`creating blob ${blobName}`);

  const fileContentsAsString = `Hello from a string`;

  const tags: Tags = {};

  // Upload blob to cool tier
  const uploadOptions: BlockBlobUploadOptions = {
    // access tier setting
    // 'Hot', 'Cool', or 'Archive'
    tier: 'Cool',

    // other properties
    metadata: undefined,
    tags
  };

  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =
    await containerClient.getBlockBlobClient(blobName);

  // Upload string
  const uploadResult = await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  if (uploadResult.errorCode) throw Error(uploadResult.errorCode);

  // Return client to continue with other operations
  return blockBlobClient;
}
//</Snippet_UploadAccessTier>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {
  // create container name
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create container
  const containerOptions: ContainerCreateOptions = {
    access: 'container' // or 'blob'
  };
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, containerOptions);
  if (containerCreateResponse.errorCode)
    throw Error('container creation failed');
  console.log('container creation succeeded');

  // upload blob to specified access tier
  const blockBlobClient: BlockBlobClient = await uploadWithAccessTier(
    containerClient
  );

  // do something with blob
  const tags: Tags = await getBlobTags(blockBlobClient);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
