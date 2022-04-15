// delete-containers.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

// soft delete may take up to 30 seconds
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

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
    // only delete containers not deleted
    includeDeleted: false,
    includeMetadata: false,
    includeSystem: true,
    prefix
  }

  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {

    const containerClient = blobServiceClient.getContainerClient(containerItem.name);

    const response = await containerClient.delete();

    if (!response.errorCode) {
      console.log(`deleted ${containerItem.name} container`);
    }
  }
}

// Undelete everything except root
async function undeleteContainer(blobServiceClient, containerName, containerVersion) {


    const { containerClient, containerUndeleteResponse } = await blobServiceClient.undeleteContainer(
      containerName, 
      containerVersion, 

      // optional/new container name - if unused, original container name is used
      //newContainerName 
      );

    if (!containerUndeleteResponse.errorCode) {
      console.log(`${containerName} is undeleted`);

      // do something with containerClient
      const containerProperties = await containerClient.getProperties();
      console.log(`${containerName} lastModified: ${containerProperties.lastModified}`);
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

    // list container properties
    const containerProperties = await containerClient.getProperties();
    console.log(`${containerName} lastModified: ${containerProperties.lastModified}`);
  }
}

async function main(blobServiceClient) {

  let containers = [];

  // container name prefix must be unique
  const containerName = 'blob-storage-dev-guide-containers-example';

  // create containers with Promise.all
  for (let i = 1; i < 9; i++) {
    containers.push(createContainer(blobServiceClient, `${containerName}-${i}`));
  }
  await Promise.all(containers);

  // delete 1 container immediately with BlobServiceClient
  await deleteContainerImmediately(blobServiceClient, `blob-storage-dev-guide-containers-example-1`);

  // soft deletes take 30 seconds - waiting now so that undelete won't throw error
  await sleep(30000);

  const containerOptions = {
    includeDeleted: true
  }

  let containerVersionForUndelete;

  // container listing returns version (timestamp) in the ContainerItem
  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {
    if(containerItem.name===`blob-storage-dev-guide-containers-example-1`){
      containerVersionForUndelete = containerItem.version;
    }
  }

  // soft delete container with ContainerClient
  const containerClient = blobServiceClient.getContainerClient(`blob-storage-dev-guide-containers-example-2`);
  await deleteContainerSoft(containerClient);

  // delete with prefix and not already deleted
  await deleteContainersWithPrefix(blobServiceClient, `blob-storage-dev-guide`);

  // undelete container
  await undeleteContainer(
    blobServiceClient, 
    `blob-storage-dev-guide-containers-example-1`, 
    containerVersionForUndelete
    );
}
main(blobServiceClient)
  .then(() => console.log('done'))
  .catch((ex) => console.log(`error: ${ex.message}`));

