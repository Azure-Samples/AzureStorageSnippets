const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

// Client
const client = BlobServiceClient.fromConnectionString(connString);

async function deleteBlob(containerClient, blobName){

  // include: Delete the base blob and all of its snapshots.
  // only: Delete only the blob's snapshots and not the blob itself.
  const options = {
    deleteSnapshots: 'include' // or 'only'
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.delete(options);

  console.log(`deleted blob ${blobName}`);

}
async function deleteBlobIfItExists(containerClient, blobName){

  // include: Delete the base blob and all of its snapshots.
  // only: Delete only the blob's snapshots and not the blob itself.
  const options = {
    deleteSnapshots: 'include' // or 'only'
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists(options);

  console.log(`deleted blob ${blobName}`);

}
async function undeleteBlob(containerClient, blobName){

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.undelete();

  console.log(`undeleted blob ${blobName}`);

}

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions){

  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  console.log(`uploading blob ${blobName}`);

  // Upload string
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // do something with blob
  // ...
}

async function main(blobServiceClient){
 
    let blobs=[];

  // create container
  const timestamp = Date.now();
  const containerName = `delete-string-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };  
  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

  console.log("container creation succeeded");

  // create 10 blobs with Promise.all
  for (let i=0; i<2; i++){
    blobs.push(createBlobFromString(containerClient, `${containerName}-${i}.txt`, `Hello from a string ${i}`));
  }
  await Promise.all(blobs);

  // delete blob 
  await deleteBlob(containerClient, `${containerName}-0.txt`);

  // delete blob if it exists
  await deleteBlobIfItExists(containerClient, `${containerName}-1.txt`);

  // restore deleted blob
  await undeleteBlob(containerClient, `${containerName}-1.txt`);
}
main(client)
.then(() => console.log("done"))
.catch((ex) => console.log(ex.message));
