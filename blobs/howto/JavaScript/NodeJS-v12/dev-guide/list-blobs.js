// index.js
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config()

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_listBlobsFlatWithPageMarker>
async function listBlobsFlat(containerClient) {
  const maxPageSize = 2;

  // Some options for filtering results
  const listOptions = {
    includeMetadata: true,
    includeSnapshots: true,
    prefix: '' // Filter results by blob name prefix
  };

  console.log("Blobs flat list (by page):");
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
async function listBlobHierarchical(containerClient, delimiter='/') {
  const maxPageSize = 20;

  // Some options for filtering list
  const listOptions = {
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
        await listBlobHierarchical(containerClient, `${delimiter}${prefix.name}`);
      }
    }

    for (const blob of response.segment.blobItems) {

      // Do something with each blob
      console.log(`\tBlobItem: name - ${blob.name}`);
    }
  }
}
// </snippet_listBlobsHierarchicalWithPageMarker>

async function main() {
  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  await listBlobsFlat(containerClient);

  await listBlobHierarchical(containerClient);

}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
