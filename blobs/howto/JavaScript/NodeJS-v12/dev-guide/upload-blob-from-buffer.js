
const path = require('path');
const fs = require('fs').promises;
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = 'storage-account-name';

// <Snippet_UploadBlob>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// buffer: blob contents as a buffer, for example, from fs.readFile()
async function uploadBlobFromBuffer(containerClient, blobName, buffer) {

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload buffer
  await blockBlobClient.uploadData(buffer);
}
// </Snippet_UploadBlob>

async function main() {

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('path/to/file', 'sample-blob.txt');

  // because no type is passed, open file as buffer
  const buffer = await fs.readFile(localFilePath);

 uploadBlobFromBuffer(containerClient, `sample-blob.txt`, buffer);
}
main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
