const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
require('dotenv').config();

// Connection string
const connString = "process.env.AZURE_STORAGE_CONNECTION_STRING";
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

//<Snippet_UploadBlobIndexTags>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// localFilePath: fully qualified path and file name
async function uploadWithIndexTags(containerClient, blobName, localFilePath) {
  // Upload blob to `Cool` access tier
  const uploadOptions = {
    // Specify index tags
    tags: {
      'Sealed': 'false',
      'Content': 'image',
      'Date': '2023-06-01',
    }
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload blob with index tags
  await blockBlobClient.uploadFile(localFilePath, uploadOptions);

  // Return client to continue with other operations
  return blockBlobClient;
}
//</Snippet_UploadBlobIndexTags>

async function main(blobServiceClient) {
  const containerClient = await blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('file-path', 'sample-blob.txt');

  // Upload blob
  const blockBlobClient = await uploadWithIndexTags(containerClient, 'sample-blob.txt', localFilePath);
}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
