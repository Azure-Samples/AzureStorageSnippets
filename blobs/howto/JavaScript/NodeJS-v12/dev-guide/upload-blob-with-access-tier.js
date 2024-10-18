const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const path = require('path');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

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

async function main() {
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('path/to/file', 'sample-blob.txt');

  // Upload blob to `Cool` access tier
  await uploadWithAccessTier(containerClient, 'sample-blob.txt', localFilePath);
}
main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
