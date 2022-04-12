// index.js
const { BlobServiceClient } = require("@azure/storage-blob");
require('dotenv').config();

const connString =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connString) throw Error("Azure Storage Connection string not found");

const client = BlobServiceClient.fromConnectionString(connString);

async function createContainer(blobServiceClient, containerName) {
  return await blobServiceClient.createContainer(containerName);
}

// only one root per blob storage
// change name to create a different container
const containerName = "dina-is-testing";

createContainer(client, containerName)
  .then((containerClient) => {
    console.log(`container ${containerName} created`);

    // do something with container client here

  }).then(() => deleteContainer(client, containerName))
  .then(() => console.log(`container ${containerName} deleted`))
  .catch((ex) => console.log(ex.message));
