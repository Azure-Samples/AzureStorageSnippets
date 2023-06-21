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
  // Specify access tier
  const uploadOptions = {
    tier: 'Cool',
  }

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload blob to cool tier
  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
//</Snippet_UploadAccessTier>

async function main(blobServiceClient) {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // Upload blob to `Cool` access tier
  const blockBlobClient = await uploadWithAccessTier(containerClient, 'sample-blob.txt', localFilePath);
}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
