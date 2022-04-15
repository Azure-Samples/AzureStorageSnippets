// delete-containers.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

// delete container immediately on blobServiceClient
async function deleteContainerImmediately(blobServiceClient, containerName) {
  const response = await blobServiceClient.deleteContainer(containerName);

  if (!response.errorCode) {
    console.log(`deleted ${containerName} container`);
  }
}

// soft delete container on ContainerClient
async function deleteContainerSoft(containerClient) {

  const response = await containerClient.delete();

  if (!response.errorCode) {
    console.log(`deleted ${containerClient.name} container`);
  }
}

async function deleteContainersWithPrefix(blobServiceClient, prefix) {

  const containerOptions = {
    includeDeleted: false,
    includeMetadata: false,
    includeSystem: true,
    prefix
  }

  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {

    const containerClient = blobServiceClient.getContainerClient(containerItem.name);

    const response = await containerClient.delete();

    if (!response.errorCode) {
      console.log(`deleted ${containerClient.name} container`);
    }
  }
}

// Undelete everything except root
async function undeleteContainers(blobServiceClient, prefix) {

  const containerOptions = {
    includeDeleted: true,
    includeMetadata: true,
    includeSystem: false,
    prefix
  }

  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {

    if (containerItem.deleted) {
      console.log(`delete ${containerItem.name} container`);
      const { containerClient, containerUndeleteResponse } = await blobServiceClient.undeleteContainer(containerItem.name, containerItem.version);

      if (!containerUndeleteResponse.errorCode) {
        console.log(`${containerClient.name} is undeleted`);

        // do something with containerClient
        const containerProperties = await containerClient.getProperties();
        console.log(`${containerClient.name} properties: ${JSON.stringify(containerProperties)}`);
      }
    }

  }
}
async function createContainer(blobServiceClient, containerName) {

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName, options);

  // check if creation worked
  if (!containerCreateResponse.errorCode) {

    console.log(`container ${containerName} created`);

    // list container properties
    const containerProperties = await containerClient.getProperties();
    console.log(`container properties = ${JSON.stringify(containerProperties)}`);
  }
}

async function main(blobServiceClient) {

  let containers = [];

  // container name prefix must be unique
  const containerName = 'blob-storage-dev-guide-delete-containers-example';

  // create containers with Promise.all
  for (let i = 0; i < 9; i++) {
    containers.push(createContainer(blobServiceClient, `${containerName}-${i}`));
  }
  await Promise.all(containers);

  // delete container immediately
  await deleteContainerImmediately(blobServiceClient, `blob-storage-dev-guide-delete-containers-example-1`);

  // soft delete container 
  const containerClient = blobServiceClient.getContainerClient(`blob-storage-dev-guide-delete-containers-example-2`);
  await deleteContainerSoft(containerClient);

  // delete with prefix
  await deleteContainersWithPrefix(blobServiceClient, `blob-storage-dev-guide`);

  // undelete containers
  await undeleteContainers(blobServiceClient, `blob-storage-dev-guide`);
}
main(blobServiceClient)
  .then(() => console.log('done'))
  .catch((ex) => console.log(`error: ${ex.message}`));

