const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

// <Snippet_UploadBlob>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function uploadBlobFromString(containerClient, blobName, fileContentsAsString){
  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient) {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  uploadBlobFromString(containerClient, 'sample-blob.txt', 'Hello string!');
}
main(client)
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
