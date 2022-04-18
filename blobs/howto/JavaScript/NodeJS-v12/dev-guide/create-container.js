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
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName, options);

  console.log(`container ${containerName} created`);

  // list container properties
  const containerProperties = await containerClient.getProperties();
  console.log(`container properties = ${JSON.stringify(containerProperties)}`);
}

async function main(blobServiceClient){

  let containers = [];

  // container name prefix must be unique
  const containerName = 'blob-storage-dev-guide';

  // create 10 containers with Promise.all
  for (let i=0; i<10; i++){
    containers.push(createContainer(blobServiceClient, `${containerName}-${i}`));
  }
  await Promise.all(containers);

  // only 1 $root per blob storage resource
  const containerRootName = '$root';

  // create root container
  await createContainer(blobServiceClient, containerRootName);

}
main(client)
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
