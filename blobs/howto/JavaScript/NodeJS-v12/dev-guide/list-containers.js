// index.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const client = BlobServiceClient.fromConnectionString(connString);

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
  for await (const response of blobServiceClient.listContainers().byPage({
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
async function main(blobServiceClient) {
  await listContainers(blobServiceClient);
  await listContainersWithPagingMarker(blobServiceClient);
}

main(client)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));