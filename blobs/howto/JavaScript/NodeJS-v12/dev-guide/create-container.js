// create-container.js
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(cibtaclient, blobName, fileContentsAsString, uploadOptions){

  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  // Upload string
  const uploadBlobResponse = await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // do something with blob
  const getTagsResponse = await blockBlobClient.getTags();
  console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
}
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

  let blobs=[];

  for (let i=0; i<10; i++){

    const uploadOptions = {

      // not indexed for searching
      metadata: {
        owner: 'PhillyProject'
      },
  
      // indexed for searching
      tags: {
        createdBy: 'YOUR-NAME',
        createdWith: `StorageSnippetsForDocs-${i}`,
        createdOn: (new Date()).toDateString()
      }
    }

    blobs.push(createBlobFromString(containerClient, `${containerName}-${i}.txt`, `Hello from a string ${i}`, uploadOptions));
  }
  await Promise.all(blobs);
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
