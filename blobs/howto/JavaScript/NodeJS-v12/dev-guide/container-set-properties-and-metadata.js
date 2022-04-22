const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error('Azure Storage Connection string not found');

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function getContainerProperties(containerClient) {

  const properties = await containerClient.getProperties();
  console.log(containerClient.containerName + ' properties: ');

  for (const property in properties) {

    switch (property) {
      // nested properties are stringified
      case 'metadata':
      //case 'objectReplicationRules':
        console.log(`    ${property}: ${JSON.stringify(properties[property])}`);
        break;
      default:
        console.log(`    ${property}: ${properties[property]}`);
        break;
    }
  }
}

/*
const metadata = {
  // values must be strings
  lastFileReview: currentDate.toString(),
  reviewer: `johnh`
}
*/
async function setContainerMetadata(containerClient, metadata) {

  await containerClient.setMetadata(metadata);

}
async function main(blobServiceClient) {

  // create container
  const timestamp = Date.now();
  const containerName = `container-set-properties-and-metadata-${timestamp}`;
  console.log(`creating container ${containerName}`);

  const containerOptions = {
    access: 'container'
  };
  const { containerClient } = await blobServiceClient.createContainer(containerName, containerOptions);

  console.log('container creation succeeded');

  const currentDate = new Date().toLocaleDateString();

  const containerMetadata = {
    // values must be strings
    lastFileReview: currentDate,
    reviewer: `johnh`
  }

  await setContainerMetadata(containerClient, containerMetadata);

  // properties including metadata
  await getContainerProperties(containerClient);


}


main(blobServiceClient)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
