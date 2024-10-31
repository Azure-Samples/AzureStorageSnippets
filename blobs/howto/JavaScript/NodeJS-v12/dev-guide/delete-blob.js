const { BlobServiceClient } = require("@azure/storage-blob");

// Azure authentication for credential dependency
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_deleteBlob>
async function deleteBlob(containerClient, blobName){

  // include: Delete the base blob and all of its snapshots
  // only: Delete only the blob's snapshots and not the blob itself
  const options = {
    deleteSnapshots: 'include'
  }

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.delete(options);
}
// </snippet_deleteBlob>

async function deleteBlobIfItExists(containerClient, blobName){

  // include: Delete the base blob and all of its snapshots.
  // only: Delete only the blob's snapshots and not the blob itself.
  const options = {
    deleteSnapshots: 'include' // or 'only'
  }

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists(options);

  console.log(`deleted blob ${blobName}`);

}

// <snippet_undeleteBlob>
async function undeleteBlob(containerClient, blobName){

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.undelete();
}
// </snippet_undeleteBlob>

async function main(){
  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // delete blob 
  await deleteBlob(containerClient, 'sample-blob.txt');

  // delete blob if it exists
  //await deleteBlobIfItExists(containerClient, 'sample-blob.txt');

  // restore deleted blob
  await undeleteBlob(containerClient, 'sample-blob.txt');
}
main()
.then(() => console.log("done"))
.catch((ex) => console.log(ex.message));
