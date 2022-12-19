// <snippet_ImportLibrary>
// index.js
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1 } = require('uuid');
require('dotenv').config();
// </snippet_ImportLibrary>

async function main() {
  try {
    /* 
    // <snippet_StorageAcctInfo__with_secrets>
    const AZURE_STORAGE_CONNECTION_STRING = 
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error('Azure Storage Connection string not found');
    }

    // Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    // </snippet_StorageAcctInfo__with_secrets>
    */

    // <snippet_StorageAcctInfo_without_secrets>
    const { DefaultAzureCredential } = require('@azure/identity');
    // </snippet_StorageAcctInfo_without_secrets>

    // <snippet_StorageAcctInfo_create_client>
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
    // </snippet_StorageAcctInfo_create_client>
    

    console.log('Azure Blob storage v12 - JavaScript quickstart sample');

    // <snippet_CreateContainer>
    // Create a unique name for the container
    const containerName = 'quickstart' + uuidv1();

    console.log('\nCreating container...');
    console.log('\t', containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create the container
    const createContainerResponse = await containerClient.create();
    console.log(
      `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
    );
    // </snippet_CreateContainer>

    // <snippet_UploadBlobs>
    // Create a unique name for the blob
    const blobName = 'quickstart' + uuidv1() + '.txt';

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(
      `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );

    // Upload data to the blob
    const data = 'Hello, World!';
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(
      `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );
    // </snippet_UploadBlobs>

    // <snippet_ListBlobs>
    console.log('\nListing blobs...');

    // List the blob(s) in the container.
    for await (const blob of containerClient.listBlobsFlat()) {
      // Get Blob Client from name, to get the URL
      const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);

      // Display blob name and URL
      console.log(
        `\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`
      );
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

  } catch (err) {
    console.err(`Error: ${err.message}`);
  }
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
  .then(() => console.log('Done'))
  .catch((ex) => console.log(ex.message));
// </snippet_CallMain>
