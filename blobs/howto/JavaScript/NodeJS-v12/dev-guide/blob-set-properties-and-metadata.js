const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

/*
metadata= {
    reviewedBy: 'Bob',
    releasedBy: 'Jill',
}
*/
async function setBlobMetadata(blobClient, metadata) {

  await blobClient.setMetadata(metadata);

  console.log(`metadata set successfully`);

}
/*
properties= {
      blobContentType: 'text/plain',
      blobContentLanguage: 'en-us',
      blobContentEncoding: 'utf-8',
      // all other http properties are cleared
    }
*/
async function setHTTPHeaders(blobClient, headers) {

  await blobClient.setHTTPHeaders(headers);

  console.log(`headers set successfully`);
}

async function getProperties(blobClient) {

  const properties = await blobClient.getProperties();
  console.log(blobClient.name + ' properties: ');

  for (const property in properties) {

    switch (property) {
      // nested properties are stringified and returned as strings
      case 'metadata':
      case 'objectReplicationRules':
        console.log(`    ${property}: ${JSON.stringify(properties[property])}`);
        break;
      default:
        console.log(`    ${property}: ${properties[property]}`);
        break;
    }
  }
}

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
    // indexed for searching
    properties: {
      blobContentType: 'text/plain',
      blobContentLanguage: 'en-us',
      blobContentEncoding: 'utf-8',
    },
    metadata: {
      reviewedBy: 'Bob',
      releasedBy: 'Jill',
    }
  }

  const blobClient = await createBlobFromString(containerClient, blob.name, blob.text);

  await setBlobMetadata(blobClient, blob.metadata);
  await setHTTPHeaders(blobClient, blob.properties);
  await getProperties(blobClient);


}


main(blobServiceClient)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
