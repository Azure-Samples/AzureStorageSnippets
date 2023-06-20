const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

//<Snippet_UploadAccessTier>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// localFilePath: fully qualified path and file name
async function uploadWithAccessTier(containerClient, blobName, localFilePath) {
  // Upload blob to `Cool` access tier
  const uploadOptions = {
    // Specify access tier
    // 'Hot', 'Cool', 'Cold', or 'Archive'
    tier: 'Cool',
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload file to cool tier in Blob Storage
  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
//</Snippet_UploadAccessTier>

async function main(blobServiceClient) {
  const containerClient = await blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // Upload blob to `Cool` access tier
  const blockBlobClient = await uploadWithAccessTier(containerClient, 'sample-blob.txt', localFilePath);
}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
