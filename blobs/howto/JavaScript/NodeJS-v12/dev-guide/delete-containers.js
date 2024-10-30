// delete-containers.js
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config()

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

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

async function main() {

  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerName = 'sample-container';

  // delete 1 container immediately with BlobServiceClient
  await deleteContainer(blobServiceClient, containerName);

  // soft delete container with ContainerClient
  //const containerClient = blobServiceClient.getContainerClient('sample-container');
  //await deleteContainerSoft(containerClient);

  // delete with prefix and not already deleted
  await deleteContainersWithPrefix(blobServiceClient, 'sample-');

  // sleep for 30 seconds
  await new Promise((resolve) => setTimeout(resolve, 30000));
  

  // undelete container
  await undeleteContainer(blobServiceClient, 'sample-container');
}

main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(`error: ${ex.message}`));

