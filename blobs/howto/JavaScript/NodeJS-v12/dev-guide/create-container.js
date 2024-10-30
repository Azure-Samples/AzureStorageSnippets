// create-container.js
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_create_container>
async function createContainer(blobServiceClient, containerName){
  const containerClient = await blobServiceClient.createContainer(containerName);

  return containerClient;
}
// </snippet_create_container>

async function main(){

  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerName = 'sample-container';

  // Create container
  await createContainer(blobServiceClient, containerName);

  // Only one $root container per storage account
  const containerRootName = '$root';

  // Create root container
  await createContainer(blobServiceClient, containerRootName);

}
main()
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
