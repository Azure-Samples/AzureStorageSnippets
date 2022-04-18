const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
// uploadOptions: {
//    metadata, 
//    onProgress: fnUpdater
//    tags, 
//    tier: accessTier (hot, cool, archive), 
//  }
async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions){

  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  // Upload string
  const uploadBlobResponse = await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // Check for errors or get tags from Azure
  if(uploadBlobResponse.errorCode) {
    console.log(`${blobName} failed to upload from file: ${errorCode}`);
  } else {
    // do something with blob
    const getTagsResponse = await blockBlobClient.getTags();
    console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
  }
}

async function main(blobServiceClient){
 
    let blobs=[];

  // create container
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };  
  const { containerClient, containerCreateResponse } = await blobServiceClient.createContainer(containerName, containerOptions);

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
