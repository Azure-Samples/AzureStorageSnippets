// create-container.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createContainer(blobServiceClient, containerName){

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const containerClient = await blobServiceClient.createContainer(containerName, options);
  console.log(`container ${containerName} created`);

  // do something with container
  // ...

  return containerClient;
}

async function main(blobServiceClient){

  // create container
  const timestamp = Date.now();
  const containerName = `create-container-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create containers
  await createContainer(blobServiceClient, containerName);

  // only 1 $root per blob storage resource
  const containerRootName = '$root';

  // create root container
  await createContainer(blobServiceClient, containerRootName);

}
main(client)
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
