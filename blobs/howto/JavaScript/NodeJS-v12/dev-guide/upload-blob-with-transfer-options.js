const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

//<Snippet_UploadBlobTransferOptions>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// localFilePath: fully qualified path and file name
async function uploadWithTransferOptions(containerClient, blobName, localFilePath) {
  // Specify data transfer options
  const uploadOptions = {
    blockSize: 4 * 1024 * 1024, // 4 MiB max block size
    concurrency: 2, // maximum number of parallel transfer workers
    maxSingleShotSize: 8 * 1024 * 1024, // 8 MiB initial transfer size
  } 

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload blob with index tags
  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
//</Snippet_UploadBlobTransferOptions>

async function main(blobServiceClient) {
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // Upload blob
  const blockBlobClient = await uploadWithTransferOptions(containerClient, 'sample-blob.txt', localFilePath);
}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
