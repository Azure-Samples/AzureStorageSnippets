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
import { getBlobServiceClientFromDefaultAzureCredential } from './get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function createContainer(
  blobServiceClient: BlobServiceClient,
  containerName: string
) {
  // public access at container level
  const options: ContainerCreateOptions = {
    access: 'container'
  };

  // creating client also creates container
  const {
    containerClient,
    containerCreateResponse
  }: {
    containerClient: ContainerClient;
    containerCreateResponse: ContainerCreateResponse;
  } = await blobServiceClient.createContainer(containerName, options);

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  console.log(`container ${containerName} created`);

  // do something with container
  // ...
  // containerClient.listBlobsFlat();

  return containerClient;
}

async function main(blobServiceClient) {
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
  // ...

  // only 1 $root per blob storage resource
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
