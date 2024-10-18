const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
const path = require('path');
require('dotenv').config();

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

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

  // Upload blob with transfer options
  await blockBlobClient.uploadFile(localFilePath, uploadOptions);
}
//</Snippet_UploadBlobTransferOptions>

async function main() {

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  const containerClient = blobServiceClient.getContainerClient('sample-container');

  // Get fully qualified path of file
  const localFilePath = path.join('path/to/file', 'sample-blob.txt');

  // Upload blob
  await uploadWithTransferOptions(containerClient, 'sample-blob.txt', localFilePath);
}
main()
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
