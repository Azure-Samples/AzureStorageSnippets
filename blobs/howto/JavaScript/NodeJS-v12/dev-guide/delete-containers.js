// index.js
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config()

const connString =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connString) throw Error("Azure Storage Connection string not found");

const client = BlobServiceClient.fromConnectionString(connString);

// immediate delete - all containers and their blobs
async function deleteAllContainersImmediately(blobServiceClient){

  for await (const containerItem of blobServiceClient.listContainers()) {

    const response = await blobServiceClient.deleteContainer(containerItem.name);

    if(!response.errorCode){
      console.log(`deleted ${containerItem.name} container`);
    }

  }
}

// Soft delete - all containers and their blobs
async function markContainersForSoftDelete(blobServiceClient){

  const containerOptions = {
    includeDeleted: false,
    includeMetadata: false,
    includeSystem: true
  }

  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {

    const containerClient = blobServiceClient.getContainerClient(containerItem.name);

    const response = await containerClient.delete();

    if(!response.errorCode){
      console.log(`deleted ${containerItem.name} container`);
    }
  }
}

// Undelete everything except root
async function undeleteContainers(blobServiceClient){

  const containerOptions = {
    includeDeleted: true,
    includeMetadata: true,
    includeSystem: false
  }

  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {

    if(containerItem.deleted){
      console.log(`delete ${containerItem.name} container`);
      const {containerClient, response } = await blobServiceClient.undeleteContainer(containerItem.name, containerItem.version);

      if (!response.errorCode){
        console.log(containerUndeleteResponse);

        // do something with containerClient
        const containerProperties = await containerClient.getProperties();
        console.log(containerProperties);
      }
    }

  }
}

// delete immediately
deleteAllContainersImmediately(client)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));

// soft delete then undelete
markContainersForSoftDelete(client)
  .then(() => console.log(`delete done`))
  .then(() => undeleteContainers(client))
  .catch((ex) => console.log(ex.message));


