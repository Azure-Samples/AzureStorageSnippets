const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const path = require('path');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

//<Snippet_UploadBlobIndexTags>
// containerClient: ContainerClient object
// blobName: string, includes file extension if provided
// localFilePath: fully qualified path and file name
async function uploadWithIndexTags(containerClient, blobName, localFilePath) {
  
  // Specify index tags for blob
  const uploadOptions = {
    tags: {
      'Sealed': 'false',
      'Content': 'image',
      'Date': '2022-07-18',
    }
  }

  // Create blob client from container client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload blob with index tags
  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
//</Snippet_UploadBlobIndexTags>

async function main() {
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('path/to/file', 'sample-blob.txt');

  // Upload blob
  const blockBlobClient = await uploadWithIndexTags(containerClient, 'sample-blob.txt', localFilePath);
}
main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
