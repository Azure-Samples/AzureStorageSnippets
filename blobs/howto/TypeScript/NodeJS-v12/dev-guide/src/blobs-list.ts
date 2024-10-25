// index.js
import {
  BlobServiceClient,
  ContainerClient,
  ContainerListBlobsOptions
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Get BlobServiceClient
import { getBlobServiceClientFromDefaultAzureCredential } from './auth-get-client';
const blobServiceClient: BlobServiceClient =
  getBlobServiceClientFromDefaultAzureCredential();

// <snippet_listBlobsFlatWithPageMarker>
async function listBlobsFlat(
  containerClient: ContainerClient
): Promise<void> {
  const maxPageSize = 2;

  // Some options for filtering results
  const listOptions: ContainerListBlobsOptions = {
    includeMetadata: true,
    includeSnapshots: true,
    prefix: '' // Filter results by blob name prefix
  };

  console.log("Blobs flat list(by page):");
  for await (const response of containerClient
    .listBlobsFlat(listOptions)
    .byPage({ maxPageSize })) {
    console.log("- Page:");
    if (response.segment.blobItems) {
      for (const blob of response.segment.blobItems) {
        console.log(`  - ${blob.name}`);
      }
    }
  }
}
// </snippet_listBlobsFlatWithPageMarker>

// <snippet_listBlobsHierarchicalWithPageMarker>
// Recursively list virtual folders and blobs
async function listBlobHierarchical(
  containerClient: ContainerClient,
  delimiter = '/'
): Promise<void> {
  const maxPageSize = 20;

  // Some options for filtering results
  const listOptions: ContainerListBlobsOptions = {
    prefix: '' // Filter results by blob name prefix
  };

  let i = 1;
  console.log(`Folder ${delimiter}`);

  for await (const response of containerClient
    .listBlobsByHierarchy(delimiter, listOptions)
    .byPage({ maxPageSize })) {
    console.log(`   Page ${i++}`);
    const segment = response.segment;

    if (segment.blobPrefixes) {
      // Do something with each virtual folder
      for await (const prefix of segment.blobPrefixes) {
        // Build new delimiter from current and next
        await listBlobHierarchical(
          containerClient,
          `${delimiter}${prefix.name}`
        );
      }
    }

    for (const blob of response.segment.blobItems) {
      // Do something with each blob
      console.log(`\tBlobItem: name - ${blob.name}`);
    }
  }
}
// </snippet_listBlobsHierarchicalWithPageMarker>

async function main(blobServiceClient: BlobServiceClient): Promise<void> {

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  await listBlobsFlat(containerClient);

  await listBlobHierarchical(containerClient);
}

main(blobServiceClient)
  .then(() => console.log(`success`))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
