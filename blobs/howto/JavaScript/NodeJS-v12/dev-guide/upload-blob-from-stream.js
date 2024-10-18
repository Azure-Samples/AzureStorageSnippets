const fs = require('fs');
const path = require('path');

const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <Snippet_UploadBlob>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// readableStream: Readable stream, for example, a stream returned from fs.createReadStream()
async function uploadBlobFromReadStream(containerClient, blobName, readableStream) {
  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload data to block blob using a readable stream
  await blockBlobClient.uploadStream(readableStream);
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

  const readableStream = fs.createReadStream(localFilePath);

  await uploadBlobFromReadStream(containerClient, 'sample-blob.txt', readableStream);

}
main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
