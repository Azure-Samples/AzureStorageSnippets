const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions){
  console.log(`creating blob ${blobName}`);
  const blockBlobClient = await client.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);
}

async function main(blobServiceClient){
 
    let blobs=[];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName);

  if(containerCreateResponse.errorCode) console.log("container creation failed");

  // create 10 blobs with Promise.all
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
main(client)
.then(() => console.log("done"))
.catch((ex) => console.log(ex.message));
