// create-container.js
import {
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions,
  ContainerCreateResponse
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

//<snippet_create_container>
async function createContainer(
  blobServiceClient: BlobServiceClient,
  containerName: string
): Promise<ContainerClient> {
  const {
    containerClient,
    containerCreateResponse
  }: {
    containerClient: ContainerClient;
    containerCreateResponse: ContainerCreateResponse;
  } = await blobServiceClient.createContainer(containerName);

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  return containerClient;
}
//</snippet_create_container>

async function main(blobServiceClient): Promise<void> {
  // create container
  const timestamp = Date.now();
  const containerName = `create-container-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create containers
  const containerClient = await createContainer(
    blobServiceClient,
    containerName
  );

  // Do something with containerClient

  // only 1 $root per storage account
  const containerRootName = '$root';

  // create root container
  await createContainer(blobServiceClient, containerRootName);
}
main(blobServiceClient)
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
