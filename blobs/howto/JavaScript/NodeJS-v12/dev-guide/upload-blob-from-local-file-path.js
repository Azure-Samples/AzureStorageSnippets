
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
// localFilePath: fully qualified path and file name
async function uploadBlobFromLocalPath(containerClient, blobName, localFilePath){
  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(localFilePath);
}
// </Snippet_UploadBlob>

async function main(blobServiceClient){
 
  let blobs=[];

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // Create 10 blobs with Promise.all
  for (let i=0; i<10; i++){
    blobs.push(uploadBlobFromLocalPath(containerClient, `sample-${i}.txt`, localFilePath));
  }
  await Promise.all(blobs);

}
main(client)
.then(() => console.log('done'))
.catch((ex) => console.log(ex.message));
