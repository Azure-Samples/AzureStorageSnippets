const fs = require('fs');
const path = require('path');

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
// readableStream: Readable stream, for example, a stream returned from fs.createReadStream()
async function uploadBlobFromReadStream(containerClient, blobName, readableStream) {
  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload data to block blob using a readable stream
  await blockBlobClient.uploadStream(readableStream);
}
// </Snippet_UploadBlob>
async function main(blobServiceClient) {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  const readableStream = fs.createReadStream(localFilePath);

  await uploadBlobFromReadStream(containerClient, 'sample-blob.txt', readableStream);

}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
