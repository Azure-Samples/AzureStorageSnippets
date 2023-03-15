// index.js
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);
const timestamp = Date.now();

async function listBlobsFlatWithPageMarker(containerClient) {
  // page size
  const maxPageSize = 2;

  let i = 1;

  // some options for filtering list
  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: ''
  };

  let iterator = containerClient
    .listBlobsFlat(listOptions)
    .byPage({ maxPageSize });
  let response = (await iterator.next()).value;

  // Prints blob names
  for (const blob of response.segment.blobItems) {
    console.log(`Flat listing: ${i++}: ${blob.name}`);
  }

  // Gets next marker
  const marker = response.continuationToken;

  // Passing next marker as continuationToken
  iterator = containerClient.listBlobsFlat().byPage({
    continuationToken: marker,
    maxPageSize: maxPageSize * 2
  });
  response = (await iterator.next()).value;

  // Prints next blob names
  for (const blob of response.segment.blobItems) {
    console.log(`Flat listing: ${i++}: ${blob.name}`);
  }
}
// Recursively list virtual folders and blobs
async function listBlobHierarchical(
  containerClient,
  virtualHierarchyDelimiter = '/'
) {
  // page size - artificially low as example
  const maxPageSize = 2;

  // some options for filtering list
  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: ''
  };

  let i = 1;
  console.log(`Folder ${virtualHierarchyDelimiter}`);

  for await (const response of containerClient
    .listBlobsByHierarchy(virtualHierarchyDelimiter, listOptions)
    .byPage({ maxPageSize })) {
    console.log(`   Page ${i++}`);
    const segment = response.segment;

    if (segment.blobPrefixes) {
      // Do something with each virtual folder
      for await (const prefix of segment.blobPrefixes) {
        // build new virtualHierarchyDelimiter from current and next
        await listBlobHierarchical(
          containerClient,
          `${virtualHierarchyDelimiter}${prefix.name}`
        );
      }
    }

    for (const blob of response.segment.blobItems) {
      // Do something with each blob
      console.log(`\tBlobItem: name - ${blob.name}`);
    }
  }
}

async function createBlobFromString(
  containerClient,
  blobName,
  fileContentsAsString,
  uploadOptions
) {
  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload string
  const uploadBlobResponse = await blockBlobClient.upload(
    fileContentsAsString,
    fileContentsAsString.length,
    uploadOptions
  );

  // do something with blob
  const getTagsResponse = await blockBlobClient.getTags();
}
async function createContainer(blobServiceClient, containerName) {
  const blobs: Promise<void>[] = [];

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const { containerClient, containerCreateResponse } =
    await blobServiceClient.createContainer(containerName, options);

  console.log(`container ${containerName} created`);

  // create 10 blobs with Promise.all
  for (let i = 0; i < 3; i++) {
    const folder1 = `a${i}`;

    const uploadOptions = {
      // not indexed for searching
      metadata: {
        owner: 'PhillyProject'
      },

      // indexed for searching
      tags: {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${i}`,
        createdOn: timestamp.toString(),
        product: i
      }
    };

    const blobName = `${folder1}/blob-${i}.txt`;
    const blobString = `blob contents ${i}`;

    console.log(`Creating: ${blobName}`);
    blobs.push(
      createBlobFromString(containerClient, blobName, blobString, uploadOptions)
    );
  }
  await Promise.all(blobs);
}

async function main(blobServiceClient) {
  const containerName = `list-containers-${timestamp}`;
  await createContainer(blobServiceClient, containerName);

  const containerClient = blobServiceClient.getContainerClient(containerName);

  await listBlobsFlatWithPageMarker(containerClient);

  await listBlobHierarchical(containerClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
