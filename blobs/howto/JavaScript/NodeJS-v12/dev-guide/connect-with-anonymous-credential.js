// connect-with-anonymous-credential.js
const { BlobServiceClient, AnonymousCredential } = require('@azure/storage-blob');
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const blobServiceUri = `https://${accountName}.blob.core.windows.net`;

const blobServiceClient = new BlobServiceClient(
  blobServiceUri,
  new AnonymousCredential()
);

async function getContainerProperties(){

  // Access level: "container"
  const containerName = `blob-storage-dev-guide-1`;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const containerProperties = await containerClient.getProperties();
  console.log(JSON.stringify(containerProperties));

}

getContainerProperties()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));