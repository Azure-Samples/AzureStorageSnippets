// index.js
import {
  BlobServiceClient,
  ServiceListContainersOptions,
  ContainerClient
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// return up to 5000 containers
async function listContainers(
  blobServiceClient: BlobServiceClient,
  containerNamePrefix: string
) {
  const options: ServiceListContainersOptions = {
    includeDeleted: false,
    includeMetadata: true,
    includeSystem: true,
    prefix: containerNamePrefix
  };

  for await (const containerItem of blobServiceClient.listContainers(options)) {
    // ContainerItem
    console.log(`For-await list: ${containerItem.name}`);

    // ContainerClient
    const containerClient: ContainerClient =
      blobServiceClient.getContainerClient(containerItem.name);

    // ... do something with container
    // containerClient.listBlobsFlat();
  }
}

async function listContainersWithPagingMarker(
  blobServiceClient: BlobServiceClient
) {
  // add prefix to filter list
  const containerNamePrefix = '';

  // page size
  const maxPageSize = 2;

  const options: ServiceListContainersOptions = {
    includeDeleted: false,
    includeMetadata: true,
    includeSystem: true,
    prefix: containerNamePrefix
  };

  let i = 1;

  let iterator = blobServiceClient
    .listContainers(options)
    .byPage({ maxPageSize });
  let response = (await iterator.next()).value;

  // Prints 2 container names
  if (response.containerItems) {
    for (const container of response.containerItems) {
      console.log(`IteratorPaged: Container ${i++}: ${container.name}`);
    }
  }

  // Gets next marker
  const marker = response.continuationToken;

  // Passing next marker as continuationToken
  iterator = blobServiceClient
    .listContainers()
    .byPage({ continuationToken: marker, maxPageSize: maxPageSize * 2 });
  response = (await iterator.next()).value;

  // Print next 4 container names
  if (response.containerItems) {
    for (const container of response.containerItems) {
      console.log(`Container ${i++}: ${container.name}`);
    }
  }
}

// assumes containers are already in storage
async function main(blobServiceClient: BlobServiceClient) {
  const containerNamePrefix = '';

  await listContainers(blobServiceClient, containerNamePrefix);
  await listContainersWithPagingMarker(blobServiceClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
