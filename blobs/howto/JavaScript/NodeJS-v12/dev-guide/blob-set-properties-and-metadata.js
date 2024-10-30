const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config()

// TODO: Replace with your actual storage account name
const accountName = '<storage-account-name>';

// <snippet_setBlobMetadata>
async function setBlobMetadata(blobClient, metadata) {
  metadata = {
    docType: 'text',
    category: 'reference'
  };

  await blobClient.setMetadata(metadata);
}
// </snippet_setBlobMetadata>

// <snippet_setHTTPHeaders>
async function setHTTPHeaders(blobClient, headers) {
  // Get existing properties
  const properties = await blobClient.getProperties();

  // Set the blobContentType and blobContentLanguage headers
  // Populate the remaining headers from the existing properties
  blobHeaders = {
    blobContentType: 'text/plain',
    blobContentLanguage: 'en-us',
    blobContentEncoding: properties.contentEncoding,
    blobCacheControl: properties.cacheControl,
    blobContentDisposition: properties.contentDisposition,
    blobContentMD5: properties.contentMD5
  },

  await blobClient.setHTTPHeaders(blobHeaders);
}
// </snippet_setHTTPHeaders>

// <snippet_getProperties>
async function getProperties(blobClient) {

  const properties = await blobClient.getProperties();
  
  console.log(`blobType: ${properties.blobType}`);
  console.log(`contentType: ${properties.contentType}`);
  console.log(`contentLength: ${properties.contentLength}`);
  console.log(`lastModified: ${properties.lastModified}`);
}
// </snippet_getProperties>

async function main() {

  // Create service client from DefaultAzureCredential
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );

  const containerClient = blobServiceClient.getContainerClient('sample-container');

  const blobClient = containerClient.getBlobClient('sample-blob.txt');

  await setBlobMetadata(blobClient);
  await setHTTPHeaders(blobClient);
  await getProperties(blobClient);
}

main()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
