const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config()

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function getContainerProperties(containerClient) {
  // Get Properties including existing metadata
  const containerProperties = await containerClient.getProperties();
  console.log(containerProperties);
}
// metadata keys are all lowercase
async function getMetadataOfContainer(containerClient) {
  const containerPropertiesResponse = await containerClient.getProperties();

  console.log(containerPropertiesResponse.metadata);
  return containerPropertiesResponse.metadata;
}
async function setMetadataOfContainer(containerClient) {

  const currentDate = new Date();

  const metadata = {
    // values must be strings
    lastFileReview: currentDate.toString(),
    reviewer: `johnh`
  }

  const response = await containerClient.setMetadata(metadata);

  console.log(`metadata set successfully`);

}
async function listContainers(blobServiceClient) {

  for await (const containerItem of blobServiceClient.listContainers()) {

    console.log(`${containerItem.name} with version ${containerItem.version} last modified on ${containerItem.properties.lastModified}`);
    const containerClient = blobServiceClient.getContainerClient(containerItem.name);

    // get system properties and custom metadata
    await getContainerProperties(containerClient);

    // Set metadata
    await setMetadataOfContainer(containerClient);

    // Get updated metadata from properties
    await getMetadataOfContainer(containerClient);
  }
}
async function main(blobServiceClient){
  // containers must already exist
  await listContainers(blobServiceClient);
}

main(blobServiceClient)
  .then(() => console.log(`done`))
  .catch((ex) => console.log(ex.message));
