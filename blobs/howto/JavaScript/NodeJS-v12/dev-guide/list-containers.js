// index.js
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config()

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// return up to 5000 containers
// <snippet_listContainers>
async function listContainers(blobServiceClient, containerNamePrefix) {

  const options = {
    includeDeleted: false,
    includeMetadata: true,
    includeSystem: true,
    prefix: containerNamePrefix
  }

  console.log("Containers (by page):");
  for await (const response of blobServiceClient.listContainers(options).byPage({
    maxPageSize: 20,
  })) {
    console.log("- Page:");
    if (response.containerItems) {
      for (const container of response.containerItems) {
        console.log(`  - ${container.name}`);
      }
    }
  }
}
// </snippet_listContainers>

// <snippet_listContainersWithPagingMarker>
async function listContainersWithPagingMarker(blobServiceClient) {

  // Specify a prefix to filter list
  const containerNamePrefix = '';

  // Specify the maximum number of containers to return per paged request
  const maxPageSize = 20;

  const options = {
    includeDeleted: false,
    includeMetadata: true,
    includeSystem: true,
    prefix: containerNamePrefix
  }
  
  let i = 1;
  let marker;
  let iterator = blobServiceClient.listContainers(options).byPage({ maxPageSize });
  let response = (await iterator.next()).value;

  // Prints 2 container names
  if (response.containerItems) {
    for (const container of response.containerItems) {
      console.log(`IteratorPaged: Container ${i++}: ${container.name}`);
    }
  }

  // Gets next marker
  marker = response.continuationToken;

  // Passing next marker as continuationToken
  iterator = blobServiceClient.listContainers().byPage({ continuationToken: marker, maxPageSize: maxPageSize * 2 });
  response = (await iterator.next()).value;

  // Print next 4 container names
  if (response.containerItems) {
    for (const container of response.containerItems) {
      console.log(`Container ${i++}: ${container.name}`);
    }
  }
}
// </snippet_listContainersWithPagingMarker>

// assumes containers are already in storage
async function main() {
  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  await listContainers(blobServiceClient, 'sample-');
  await listContainersWithPagingMarker(blobServiceClient);
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));