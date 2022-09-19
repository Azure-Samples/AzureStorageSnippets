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

  const containerName = `container${Date.now()}`;
  console.log(containerName);

  // public access at container level
  const options = {
    access: 'container'
  };

  // creating client also creates container
  const containerClient = await blobServiceClient.createContainer(containerName, options);
  console.log(`container ${containerName} created`);

  // do something with containerClient
  // ...

}

getContainerProperties()
  .then(() => console.log(`done`))
  .catch((ex) => console.log(`error: ${ex.message}`));