// delete-containers.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');
const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

// soft delete may take up to 30 seconds
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

// delete container immediately on blobServiceClient
// <snippet_delete_container_immediately>
async function deleteContainer(blobServiceClient, containerName) {
  
  return await blobServiceClient.deleteContainer(containerName);
}
// </snippet_delete_container_immediately>

// soft delete container on ContainerClient
async function deleteContainerSoft(containerClient) {

  return await containerClient.delete();

}

// <snippet_deleteContainersWithPrefix>
async function deleteContainersWithPrefix(blobServiceClient, prefix) {

  const containerOptions = {
    includeDeleted: false,
    includeMetadata: false,
    includeSystem: true,
    prefix
  }

  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {

    try{
      const containerClient = blobServiceClient.getContainerClient(containerItem.name);

      await containerClient.delete();
  
      console.log(`Deleted ${containerItem.name} container - success`);
    }catch(ex){
      console.log(`Deleted ${containerItem.name} container - failed - ${ex.message}`);
    }
  }
}
// </snippet_deleteContainersWithPrefix>

// Undelete specific container - last version
// <snippet_undeleteContainer>
async function undeleteContainer(blobServiceClient, containerName) {
  // Version to restore
  let containerVersion;

  const containerOptions = {
    includeDeleted: true,
    prefix: containerName
  }

  // Find the deleted container and restore it
  for await (const containerItem of blobServiceClient.listContainers(containerOptions)) {
    if (containerItem.name === containerName) {
      containerVersion = containerItem.version;
    }
  }

  const containerClient = await blobServiceClient.undeleteContainer(
    containerName,
    containerVersion,
  );
}
// </snippet_undeleteContainer>
async function createContainer(blobServiceClient, containerName) {

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName, options);

  // list container properties
  const containerProperties = await containerClient.getProperties();
  console.log(`${containerName} lastModified: ${containerProperties.lastModified}`);
  
}

async function main(blobServiceClient) {

  let containers = [];

  const timestamp = Date.now();
  const containerName = `create-container-${timestamp}`;

  // create containers with Promise.all
  for (let i = 1; i < 9; i++) {
    containers.push(createContainer(blobServiceClient, `${containerName}-${i}`));
  }
  await Promise.all(containers);

  // delete 1 container immediately with BlobServiceClient
  await deleteContainer(blobServiceClient, `${containerName}-1`);

  // soft deletes take 30 seconds - waiting now so that undelete won't throw error
  await sleep(30000);

  // soft delete container with ContainerClient
  const containerClient = blobServiceClient.getContainerClient(`${containerName}-2`);
  await deleteContainerSoft(containerClient);

  // delete with prefix and not already deleted
  await deleteContainersWithPrefix(blobServiceClient, `${containerName}`);

  // undelete container
  await undeleteContainer(
    blobServiceClient,
    `${containerName}-1`
  );
}
main(blobServiceClient)
  .then(() => console.log('done'))
  .catch((ex) => console.log(`error: ${ex.message}`));

