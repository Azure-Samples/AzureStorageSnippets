const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = 'storageaccounttestfns';

//<Snippet_UploadAccessTier>
async function uploadWithAccessTier(containerClient, blobName) {

  const fileContentsAsString = `Hello from a string`

  // upload blob to `Cool` access tier
  const uploadOptions = {
    // 'Hot', 'Cool', 'Cold', or 'Archive'
    tier: 'Cool',
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload string
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // Return client to continue with other operations
  return blockBlobClient;
}
//</Snippet_UploadAccessTier>

async function main() {

  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  // Create container client
  const containerName = 'sample-container';
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // upload blob to specific access tier
  await uploadWithAccessTier(containerClient, 'sample-blob3');
}
main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
