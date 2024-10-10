const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

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
  
  console.log(`blobType: ${propertiesResponse.blobType}`);
  console.log(`contentType: ${propertiesResponse.contentType}`);
  console.log(`contentLength: ${propertiesResponse.contentLength}`);
  console.log(`lastModified: ${propertiesResponse.lastModified}`);
}
// </snippet_getProperties>

// containerName: string
// blobName: string, includes file extension if provided
// fileContentsAsString: blob content
async function createBlobFromString(client, blobName, fileContentsAsString, uploadOptions) {

  // Create blob client from container client
  const blockBlobClient = await client.getBlockBlobClient(blobName);

  console.log(`uploading blob ${blobName}`);

  // Upload string
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // do something with blob
  // ...
  return blockBlobClient;
}
async function main(blobServiceClient) {

  // create container
  const timestamp = Date.now();
  const containerName = `blob-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

  console.log('container creation succeeded');

  // create blob 
  const blob = {
    name: `my-blob.txt`,
    text: `Hello from a string`,
  }

  const blobClient = await createBlobFromString(containerClient, blob.name, blob.text);

  await setBlobMetadata(blobClient);
  await setHTTPHeaders(blobClient);
  await getProperties(blobClient);


}


main(blobServiceClient)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
