const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Connection string
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

// Client
const client = BlobServiceClient.fromConnectionString(connString);

//<Snippet_UploadAccessTier>
async function uploadWithAccessTier(containerClient) {

  // Create blob
  const timestamp = Date.now();
  const blobName = `myblob-${timestamp}`;
  console.log(`creating blob ${blobName}`);

  const fileContentsAsString = `Hello from a string`

  // upload blob to `Cool` access tier
  const uploadOptions = {

    // access tier setting
    // 'Hot', 'Cool', or 'Archive'
    tier: 'Cool',

    // other properties
    metadata: undefined,
    tags: undefined,
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload string
  await blockBlobClient.upload(fileContentsAsString, fileContentsAsString.length, uploadOptions);

  // Return client to continue with other operations
  return blockBlobClient;
}
//</Snippet_UploadAccessTier>

async function main(blobServiceClient) {

  // create container name
  const timestamp = Date.now();
  const containerName = `createblobfromstring-${timestamp}`;
  console.log(`creating container ${containerName}`);

  // create container
  const containerOptions = {
    access: 'container', // or 'blob'
  };
  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);
  console.log('container creation succeeded');

  // upload blob to specific access tier
  const blockBlobClient = await uploadWithAccessTier(containerClient);

  // do something with blob
  const getTagsResponse = await blockBlobClient.getTags();
  console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);

}
main(client)
  .then(() => console.log('done'))
  .catch((ex) => console.log(ex.message));
