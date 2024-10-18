const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

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

async function main() {
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  uploadBlobFromString(containerClient, 'sample-blob.txt', 'Hello string!');
}
main()
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
