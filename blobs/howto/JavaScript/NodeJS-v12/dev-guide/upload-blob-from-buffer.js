
const path = require('path');
const fs = require('fs').promises;
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
// buffer: blob contents as a buffer, for example, from fs.readFile()
async function uploadBlobFromBuffer(containerClient, blobName, buffer) {

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload buffer
  await blockBlobClient.uploadData(buffer);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient) {

  let blobs = [];

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // because no type is passed, open file as buffer
  const buffer = await fs.readFile(localFilePath);

  // create blobs with Promise.all
  // include the file extension
  for (let i = 0; i < 10; i++) {
    blobs.push(uploadBlobFromBuffer(containerClient, `sample-${i}.jpg`, buffer));
  }
  await Promise.all(blobs);

}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
