// <snippet_ImportLibrary>
// index.js
import { BlobServiceClient, ContainerCreateOptions } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();
// </snippet_ImportLibrary>

// <snippet_StorageAcctInfo>
const AZURE_STORAGE_CONNECTION_STRING = process.env
  .AZURE_STORAGE_CONNECTION_STRING as string;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error('Azure Storage Connection string not found');
}
// </snippet_StorageAcctInfo>

async function main() {
  console.log('Azure Blob storage v12 - JavaScript quickstart sample');

  // <snippet_CreateContainer>
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  // Create a unique name for the container
  const containerName = 'quickstart' + uuidv4();

  console.log('\nCreating container...');
  console.log('\t', containerName);

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);
  // Create the container
  const containerOptions: ContainerCreateOptions = {
    access: 'container'
  };
  const createContainerResponse = await containerClient.create(
    containerOptions
  );
  console.log(
    'Container was created successfully. requestId: ',
    createContainerResponse.requestId
  );
  // </snippet_CreateContainer>

  // <snippet_UploadBlobs>
  // Create a unique name for the blob
  const blobName = 'quickstart' + uuidv4() + '.txt';

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  console.log('\nUploading to Azure storage as blob:\n\t', blobName);

  // Upload data to the blob
  const data = 'Hello, World!';
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  console.log(
    'Blob was uploaded successfully. requestId: ',
    uploadBlobResponse.requestId
  );
  // </snippet_UploadBlobs>

  // <snippet_ListBlobs>
  console.log('\nListing blobs...');

  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat({
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: ''
  })) {
    console.log('\t', blob.name);
  }
  // </snippet_ListBlobs>

  // <snippet_DownloadBlobs>
  // Get blob content from position 0 to the end
  // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  console.log('\nDownloaded blob content...');
  console.log(
    '\t',
    await streamToText(downloadBlockBlobResponse.readableStreamBody)
  );
  // </snippet_DownloadBlobs>

  // <snippet_DeleteContainer>
  // Delete container
  console.log('\nDeleting container...');

  const deleteContainerResponse = await containerClient.delete();
  console.log(
    'Container was deleted successfully. requestId: ',
    deleteContainerResponse.requestId
  );
  // </snippet_DeleteContainer>
}
// <snippet_ConvertStreamToText>
// Convert stream to text
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}
// </snippet_ConvertStreamToText>

// <snippet_CallMain>
main()
  .then(() => console.log('success'))
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.log(err.message);
    }
  });
// </snippet_CallMain>
