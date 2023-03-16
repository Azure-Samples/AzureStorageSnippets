import {
  BlobServiceClient,
  ContainerClient,
  ContainerCreateOptions,
  ContainerCreateResponse,
  ContainerGetPropertiesResponse,
  Metadata
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

async function getContainerProperties(containerClient: ContainerClient) {
  const properties: ContainerGetPropertiesResponse =
    await containerClient.getProperties();
  console.log(containerClient.containerName + ' properties: ');

  for (const property in properties) {
    switch (property) {
      // nested properties are stringified
      case 'metadata':
        //case 'objectReplicationRules':
        console.log(`    ${property}: ${JSON.stringify(properties[property])}`);
        break;
      default:
        console.log(`    ${property}: ${properties[property]}`);
        break;
    }
  }
}

/*
const metadata = {
  // values must be strings
  lastFileReview: currentDate.toString(),
  reviewer: `johnh`
}
*/
async function setContainerMetadata(
  containerClient: ContainerClient,
  metadata: Metadata
) {
  await containerClient.setMetadata(metadata);
}
async function main(blobServiceClient: BlobServiceClient) {
  // create container
  const timestamp = Date.now();
  const containerName = `container-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const {
    containerClient,
    containerCreateResponse
  }: {
    containerClient: ContainerClient;
    containerCreateResponse: ContainerCreateResponse;
  } = await blobServiceClient.createContainer(containerName, containerOptions);

  if (containerCreateResponse.errorCode)
    throw Error(containerCreateResponse.errorCode);

  console.log('container creation succeeded');

  const currentDate = new Date().toLocaleDateString();

  const containerMetadata: Metadata = {
    // values must be strings
    lastFileReview: currentDate,
    reviewer: `johnh`
  };

  await setContainerMetadata(containerClient, containerMetadata);

  // properties including metadata
  await getContainerProperties(containerClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
