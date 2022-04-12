// index.js
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

const client = BlobServiceClient.fromConnectionString(connString);

async function listContainers(blobServiceClient){

  // add prefix to filter list
  const containerNamePrefix = "";

  const options = {
    includeDeleted: false,
    includeMetadata: true,
    includeSystem: true,
    prefix: containerNamePrefix
  }

  for await (const containerItem of blobServiceClient.listContainers(options)) {

      console.log(`${containerItem.name} with version ${containerItem.version} last modified on ${containerItem.properties.lastModified}`);
      const containerClient = blobServiceClient.getContainerClient(containerItem.name);
      const containerProperties = await containerClient.getProperties();
      console.log(containerProperties);
  }
}

async function listContainersWithPagingMarker(blobServiceClient){

  // add prefix to filter list
  const containerNamePrefix = "";

  // page size
  const maxPageSize = 2;

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
      console.log(`Container ${i++}: ${container.name}`);
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

listContainers(client)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));


listContainersWithPagingMarker(client)
.then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));