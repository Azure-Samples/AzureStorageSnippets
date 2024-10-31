import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
  ContainerClient,
  ContainerCreateOptions,
  Tags
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
import { blob } from 'stream/consumers';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

//<Snippet_UploadAccessTier>
async function uploadWithAccessTier(
  containerClient: ContainerClient,
  blobName: string
): Promise<BlockBlobClient> {

  const fileContentsAsString = `Hello from a string`;

  // Upload blob to cool tier
  const uploadOptions: BlockBlobUploadOptions = {
    // 'Hot', 'Cool', 'Cold', or 'Archive'
    tier: 'Cool',
  };

  // Create blob client from container client
  const blockBlobClient: BlockBlobClient =  containerClient.getBlockBlobClient(blobName);

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
    containerClient, 'sample-blob.txt'
  );
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
