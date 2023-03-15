// index.js
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

const client = BlobServiceClient.fromConnectionString(connString);

// return up to 5000 containers
async function listContainers(blobServiceClient, containerNamePrefix) {
  const options = {
    includeDeleted: false,
    includeMetadata: true,
    includeSystem: true,
    prefix: containerNamePrefix
  };

  for await (const containerItem of blobServiceClient.listContainers(options)) {
    // ContainerItem
    console.log(`For-await list: ${containerItem.name}`);

    // ContainerClient
    const containerClient = blobServiceClient.getContainerClient(
      containerItem.name
    );

    // ... do something with container
  }
}

async function listContainersWithPagingMarker(blobServiceClient) {
  // add prefix to filter list
  const containerNamePrefix = '';

  // page size
  const maxPageSize = 2;

  const options = {
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
async function main(blobServiceClient) {
  const containerNamePrefix = '';

  await listContainers(blobServiceClient, containerNamePrefix);
  await listContainersWithPagingMarker(blobServiceClient);
}

main(client)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
