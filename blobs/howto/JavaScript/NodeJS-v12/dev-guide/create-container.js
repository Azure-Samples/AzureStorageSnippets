// create-container.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// <snippet_create_container>
async function createContainer(blobServiceClient, containerName){
  const containerClient = await blobServiceClient.createContainer(containerName);

  return containerClient;
}
// </snippet_create_container>

async function main(blobServiceClient){

  // create container
  const timestamp = Date.now();
  const containerName = `create-container-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create containers
  await createContainer(blobServiceClient, containerName);

  // only 1 $root per storage account
  const containerRootName = '$root';

  // create root container
  await createContainer(blobServiceClient, containerRootName);

}
main(client)
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
